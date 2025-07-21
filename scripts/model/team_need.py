# team_need.py  – July 2025
# -------------------------------------------------------------
#   Computes a Team-Need score for transfer-portal candidates.
#   – Urgency based on who Illinois lost (minutes% × positive BPM)
#   – Similarity on height + core stats to EACH departed player
#   – Score = (urgency^0.5) × best_similarity
#   – Normalised so top candidate = 1.000
# -------------------------------------------------------------
import math, re
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd

# ------------------------------------------------------------------------
# 0.  Configuration
# ------------------------------------------------------------------------
_POSITION_REGEX = {
    "PG":   r"(pg|point)",
    "SG":   r"(sg|shoot|combo\s?g)",
    "Wing": r"(wing|sf|g/f)",
    "PF":   r"(pf|stretch\s?4|4$)",
    "C":    r"(c$|center|pf/c)",
}

FEATURES      = ["heightIn", "bpm", "ortg", "usg", "efg"]
FEAT_WEIGHTS  = dict(zip(FEATURES, [0.25, 0.25, 0.20, 0.15, 0.15]))
URGENCY_POWER = 0.5           # √urgency; lower → less positional dominance
MIN_MIN_PCT   = 10.0          # ignore fringe departures (<10 % minutes)

# ------------------------------------------------------------------------
# 1.  Utility functions
# ------------------------------------------------------------------------
def _to_inches(h_str: str) -> float:
    if isinstance(h_str, str) and "-" in h_str:
        ft, inch = h_str.split("-")
        try:
            return int(ft) * 12 + int(inch)
        except ValueError:
            return np.nan
    return np.nan

def map_role(role: str) -> str:
    if pd.isna(role):
        return "Unknown"
    role = role.lower()
    for bucket, pat in _POSITION_REGEX.items():
        if re.search(pat, role):
            return bucket
    return "Unknown"

def load_df(path: str | Path, roster=False) -> pd.DataFrame:
    df = pd.read_json(path)
    num_cols = ["minPct", "bpm", "ortg", "usg", "efg"]
    df[num_cols] = df[num_cols].apply(pd.to_numeric, errors="coerce")
    df["heightIn"] = df["height"].apply(_to_inches)
    df["posBucket"] = df["role"].apply(map_role)
    if roster:
        df["bpm"] = df["bpm"].fillna(0)
    return df

def departures(roster: pd.DataFrame) -> pd.DataFrame:
    mask = (roster["leftAfterSeason"] == True) & (roster["minPct"] >= MIN_MIN_PCT)
    dep = roster.loc[mask].copy()
    dep["importance"] = dep["minPct"]/100 * dep["bpm"].clip(lower=0)
    return dep

# ------------------------------------------------------------------------
# 2.  Similarity between two player rows
# ------------------------------------------------------------------------
def _z(val, mu, sigma):
    return (val - mu) / sigma if sigma > 0 else 0.0

def _sim_row_to_row(a: pd.Series, b: pd.Series, stats) -> float:
    dist = 0.0
    for f, w in FEAT_WEIGHTS.items():
        va, vb = a.get(f, np.nan), b.get(f, np.nan)
        if np.isnan(va) or np.isnan(vb):
            continue
        mu, sd = stats[f]
        dist += w * abs(_z(va, mu, sd) - _z(vb, mu, sd))
    return math.exp(-dist)          # 1 → identical, ~0 → dissimilar

# ------------------------------------------------------------------------
# 3.  Main scoring routine
# ------------------------------------------------------------------------
def score_transfers(departed_roster_path, transfer_path):
    roster      = load_df(departed_roster_path, roster=True)
    dep_players = departures(roster)

    # Positional urgency (sums to 1.0)
    urgency_vec = (
        dep_players.groupby("posBucket")["importance"].sum() /
        dep_players["importance"].sum()
    ).to_dict()

    # Combine transfers + departures to get reference mean/std for z-scores
    transfers   = load_df(transfer_path)
    ref_stats   = pd.concat([transfers[FEATURES], dep_players[FEATURES]],
                            ignore_index=True)
    feat_stats  = {f: (ref_stats[f].mean(skipna=True),
                       ref_stats[f].std(skipna=True)) for f in FEATURES}

    # Pre-index departures by bucket
    dep_by_bucket: Dict[str, pd.DataFrame] = {
        b: grp.reset_index(drop=True)
        for b, grp in dep_players.groupby("posBucket")
    }

    matched_to: List[str] = []
    need_scores: List[float] = []

    for _, tr in transfers.iterrows():
        bucket   = map_role(tr["role"])
        urg_raw  = urgency_vec.get(bucket, 0.0)
        if urg_raw == 0 or bucket not in dep_by_bucket:
            matched_to.append(None); need_scores.append(0.0); continue

        urg = urg_raw ** URGENCY_POWER
        sims = dep_by_bucket[bucket].apply(
            lambda dep: _sim_row_to_row(tr, dep, feat_stats), axis=1
        )
        idx_best  = sims.idxmax()
        best_sim  = sims.loc[idx_best]
        best_name = dep_by_bucket[bucket].loc[idx_best, "name"]

        matched_to.append(best_name)
        need_scores.append(urg * best_sim)

    transfers["needScore_raw"] = need_scores
    transfers["matchedTo"]     = matched_to

    # Filter out anyone already on Illinois
    transfers = transfers[transfers["team"] != "Illinois"].copy()

    # Normalise so best fit = 1.0
    max_raw = transfers["needScore_raw"].max() or 1.0
    transfers["needScore"] = transfers["needScore_raw"] / max_raw

    cols = ["player", "team", "role", "heightIn", "bpm",
            "needScore", "matchedTo"]
    return transfers.sort_values("needScore", ascending=False)[cols]

# ------------------------------------------------------------------------
# 4.  Example driver  (adjust paths as needed)
# ------------------------------------------------------------------------
if __name__ == "__main__":
    ranked = score_transfers(
        "data/illinois-roster-2025.json",   
        "data/transfer-players-2026.json"   
    )
    print(ranked.head(1000).to_string(index=False))
