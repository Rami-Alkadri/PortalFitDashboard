# quality.py  – Player‑Quality pillar (July 2025)
# -------------------------------------------------------------
#  * Reputation (247 + Torvik) 50 %
#  * Production index           30 %
#  * Competition strength       20 %
#  * Strengths / Weaknesses vs. Illinois positional means
# -------------------------------------------------------------
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd

import re
# ---------------------------------------------------------------------
# 0.  Global config & weights
# ---------------------------------------------------------------------
WEIGHTS = {"Rep": 0.50, "Prod": 0.33, "Comp": 0.33}
POSITION_REGEX = {
    "PG": r"(pg|point)",
    "SG": r"(sg|shoot|combo\\s?g)",
    "Wing": r"(wing|sf|g/f)",
    "PF": r"(pf|stretch\\s?4|4$)",
    "C": r"(c$|center|pf/c)",
}
#   **column names must exactly match those in transfer‑players JSON**
CORE_STATS = [
    "bpm", "ortg", "usg", "efg", "ts", "threepPct", "twopPct",
]

# ---------------------------------------------------------------------
# 1.  Utility helpers
# ---------------------------------------------------------------------

def map_role(role: str) -> str:
    if pd.isna(role):
        return "Unknown"
    r = role.lower()
    for b, pat in POSITION_REGEX.items():
        if re.search(pat, r):
            return b
    return "Unknown"


def torvik_percentile(rank: float, n_players: int) -> float:
    if pd.isna(rank):
        return np.nan
    return 1 - (rank - 1) / (n_players - 1)


def sigmoid(x: float) -> float:
    return 1 / (1 + np.exp(-x))

# ---------------------------------------------------------------------
# 2.  Reputation feature
# ---------------------------------------------------------------------

def build_reputation(df_players: pd.DataFrame, df_247: pd.DataFrame) -> pd.Series:
    df_247 = df_247.copy()
    df_247["name_lc"] = df_247["name"].str.lower()
    df_players["name_lc"] = df_players["player"].str.lower()
    merged = df_players.merge(df_247[["name_lc", "rating"]], on="name_lc", how="left")

    n_players = len(df_players)
    p_rank = merged["rk"].apply(lambda r: torvik_percentile(r, n_players))
    r247 = merged["rating"].astype(float)

    rep_vals = []
    for a, b in zip(r247, p_rank):
        if pd.notna(a) and pd.notna(b):
            rep_vals.append((a + b) / 2)
        else:
            rep_vals.append(max(a if pd.notna(a) else 0, b if pd.notna(b) else 0))
    return pd.Series(rep_vals, index=merged.index, name="Rep")

# ---------------------------------------------------------------------
# 3.  Production index
# ---------------------------------------------------------------------

def production_index(df_players: pd.DataFrame) -> pd.Series:
    df = df_players.copy()
    df[["bpm", "ortg", "usg"]] = df[["bpm", "ortg", "usg"]].apply(pd.to_numeric, errors="coerce")
    df["posBucket"] = df["role"].apply(map_role)
    bpm_z = pd.Series(index=df.index, dtype=float)
    for pos, grp in df.groupby("posBucket"):
        mu, sd = grp["bpm"].mean(), grp["bpm"].std()
        bpm_z.loc[grp.index] = (grp["bpm"] - mu) / (sd if sd else 1)
    eff = (df["ortg"] - 100) / 25
    usage_pen = ((df["usg"] - 20).abs() - 5).clip(lower=0) / 15
    prod_raw = 0.3 * bpm_z + 0.04 * eff - 2 * usage_pen
    return sigmoid(prod_raw).rename("Prod")

# ---------------------------------------------------------------------
# 4.  Competition strength
# ---------------------------------------------------------------------

def competition_strength(df_players: pd.DataFrame, df_team: pd.DataFrame) -> pd.Series:
    comp_vals = []
    for _, row in df_players.iterrows():
        bar_row = df_team.loc[(df_team["team"] == row["team"]) & (df_team["year"] == row["year"]), "barthag"]
        if bar_row.empty or pd.isna(bar_row.iloc[0]):
            comp_vals.append(0.5)
            continue
        bar_val = bar_row.iloc[0]
        pct = (df_team[df_team["year"] == row["year"]]["barthag"] < bar_val).mean()
        comp_vals.append(float(pct))
    return pd.Series(comp_vals, index=df_players.index, name="Comp")

# ---------------------------------------------------------------------
# 5.  Strengths & weaknesses helper
# ---------------------------------------------------------------------

def strengths_weaknesses(row: pd.Series, ill_pos_means: Dict[str, pd.Series], k: int = 3) -> Tuple[List[str], List[str]]:
    pos = map_role(row.get("role", ""))
    if pos not in ill_pos_means:
        pos = "SG" if pos == "PG" and "SG" in ill_pos_means else "ALL"
    base = ill_pos_means.get(pos)
    if base is None:
        return [], []
    player_vals = row[CORE_STATS].apply(pd.to_numeric, errors="coerce")
    deltas = (player_vals - base).abs().sort_values()
    return deltas.index[:k].tolist(), deltas.index[-k:].tolist()

# ---------------------------------------------------------------------
# 6.  Main scoring function
# ---------------------------------------------------------------------

def score_quality(year: int, data_dir: str | Path = "data") -> pd.DataFrame:
    players_fp = Path(data_dir) / f"transfer-players-{year + 1}.json"
    team_fp    = Path(data_dir) / f"team-data-{year}.json"
    rating_fp  = Path(data_dir) / f"transfers-247sports-{year + 1}.json"
    ill_fp     = Path(data_dir) / f"illinois-roster-{year}.json"

    df_players = pd.read_json(players_fp)
    df_players["year"] = year
    df_247  = pd.read_json(rating_fp)
    df_team = pd.read_json(team_fp)
    
    
    df_players = df_players.join(build_reputation(df_players, df_247))
    df_players = df_players.join(production_index(df_players))
    df_players = df_players.join(competition_strength(df_players, df_team))

    df_players["quality_raw"] = (
        WEIGHTS["Rep"]  * df_players["Rep"].fillna(0) +
        WEIGHTS["Prod"] * df_players["Prod"].fillna(0) +
        WEIGHTS["Comp"] * df_players["Comp"].fillna(0)
    )

    # Illinois positional baselines
    ill = pd.read_json(ill_fp)
    
    # after loading df_players = pd.read_json(players_fp)
    df_players.rename(columns={
        "twoPPct":   "twopPct",
        "threePPct": "threepPct",
    }, inplace=True)

    # after loading ill = pd.read_json(ill_fp)
    ill.rename(columns={
        "twoPPct":   "twopPct",
        "threePPct": "threepPct",
    }, inplace=True)

    ill[CORE_STATS] = ill[CORE_STATS].apply(pd.to_numeric, errors="coerce")
    ill["posBucket"] = ill["role"].apply(map_role)
    ill_pos_means = {pos: grp[CORE_STATS].mean() for pos, grp in ill.groupby("posBucket")}
    ill_pos_means["ALL"] = ill[CORE_STATS].mean() 

    strengths, weaknesses = zip(*df_players.apply(lambda r: strengths_weaknesses(r, ill_pos_means), axis=1))
    df_players["strengths"], df_players["weaknesses"] = strengths, weaknesses

    # Normalise to 0‑1
    hi = df_players["quality_raw"].max() or 1.0
    df_players["qualityScore"] = df_players["quality_raw"] / hi

    return df_players[["player", "team", "role", "qualityScore", "strengths", "weaknesses"]] \
        .sort_values("qualityScore", ascending=False)

# ---------------------------------------------------------------------
if __name__ == "__main__":
    import re
    ranked = score_quality(2025, data_dir="data")
    print(ranked.head(400).to_string(index=False))
