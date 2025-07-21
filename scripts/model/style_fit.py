# style_fit.py  – Stylistic‑Fit pillar  (July 2025)
# -------------------------------------------------------------
#   • 18‑feature style vectors
#   • PCA to remove multicollinearity (orthogonal comps)
#   • Cosine similarity   → rescaled to 0‑1
#   • Illinois reference = 4‑season mean (2022‑25)
#   • Outputs similarity & dissimilarity feature lists
# -------------------------------------------------------------
import warnings
warnings.filterwarnings("ignore")
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler


# -------------------------------------------------------------------------
# 0.  Configuration
# -------------------------------------------------------------------------
FEATURES = [
    "adjT", "rawT",
    "threePRate", "threePRateD",
    "twoPPct", "twoPPctD",
    "astPct", "opAstPct",
    "tovPct", "tovPctD",
    "oRebPct", "opORebPct",
    "blkPct", "blkedPct",
    "ftRate", "ftRateD",
    "effHgt"
]

N_PCS = 6                # keep first 6 PCs (~80% var), tune if desired
MIN_FEAT_COVERAGE = 16   # require at least 16/18 non‑NA to build vector


# -------------------------------------------------------------------------
# 1.  Load & clean team‑season stats
# -------------------------------------------------------------------------
def load_team_year(path: str | Path, year: int) -> pd.DataFrame:
    df = pd.read_json(path)
    df["year"] = year
    df = df[["team", "year"] + FEATURES].copy()
    df[FEATURES] = df[FEATURES].apply(pd.to_numeric, errors="coerce")
    return df


def concat_team_stats(year_files: Dict[int, str | Path]) -> pd.DataFrame:
    frames = [load_team_year(p, y) for y, p in year_files.items()]
    return pd.concat(frames, ignore_index=True)


# -------------------------------------------------------------------------
# 2.  Build PCA model & style vectors
# -------------------------------------------------------------------------
class StyleModel:
    """Fit PCA on league‑wide data, keep μ/σ for z‑scoring per feature."""
    def __init__(self, n_pcs: int = N_PCS):
        self.scaler = StandardScaler()
        self.pca    = PCA(n_components=n_pcs)

    def fit(self, df_all: pd.DataFrame):
        X = df_all[FEATURES].fillna(df_all[FEATURES].mean())
        self.scaler.fit(X)
        Xz = self.scaler.transform(X)
        self.pca.fit(Xz)

    def vector(self, row: pd.Series) -> np.ndarray:
        """Return PCA vector (shape n_pcs,) or None if insufficient data."""
        if row[FEATURES].count() < MIN_FEAT_COVERAGE:
            return None
        mean_dict = dict(zip(FEATURES, self.scaler.mean_))
        x = row[FEATURES].fillna(mean_dict).values.reshape(1, -1)
        xz = self.scaler.transform(x)
        return self.pca.transform(xz).flatten()


# -------------------------------------------------------------------------
# 3.  Cosine similarity utilities
# -------------------------------------------------------------------------
def cosine(u: np.ndarray, v: np.ndarray) -> float:
    return float(np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v)))

def to_0_1(x: float) -> float:
    return (x + 1) / 2            # maps [‑1,1] → [0,1]


# -------------------------------------------------------------------------
# 4.  Illinois reference vector  (4‑yr mean of PCA scores)
# -------------------------------------------------------------------------
def illinois_reference(df_all: pd.DataFrame,
                       model: StyleModel) -> np.ndarray:
    ill_df = df_all[df_all["team"] == "Illinois"].copy()
    vecs   = ill_df.apply(model.vector, axis=1).dropna().tolist()
    return np.mean(vecs, axis=0)     # 4‑yr average


# -------------------------------------------------------------------------
# 5.  Explain‑why helper  (top closest / furthest raw features)
# -------------------------------------------------------------------------
def explain_stats(orig_row: pd.Series,
                  ill_mean_row: pd.Series,
                  k: int = 3) -> Tuple[List[str], List[str]]:
    deltas = (orig_row[FEATURES] - ill_mean_row[FEATURES]).abs().astype(float)
    if deltas.isna().all():
        return [], []
    closest = deltas.nsmallest(k).index.tolist()
    furthest = deltas.nlargest(k).index.tolist()
    return closest, furthest


# -------------------------------------------------------------------------
# 6.  Main ranking function
# -------------------------------------------------------------------------
def rank_transfers(style_data: pd.DataFrame,
                   transfers_path: str | Path,
                   ill_year_mean: pd.Series,
                   model: StyleModel) -> pd.DataFrame:
    transfers = pd.read_json(transfers_path)
    transfers["year"] = transfers["origYear"] = transfers["rk"].apply(
        lambda _: 2025)   # <-- if your JSON lacks year col, set manually

    # Merge to fetch origin team stats for the correct year
    merged = transfers.merge(
        style_data,
        how="left",
        left_on=["team", "origYear"],
        right_on=["team", "year"],
        suffixes=("", "_team"),
    )

    scores, similar, dissim = [], [], []

    for _, row in merged.iterrows():
        vec_orig = model.vector(row)
        if vec_orig is None:
            scores.append(0.0); similar.append([]); dissim.append([]); continue

        score = to_0_1(cosine(vec_orig, ill_ref_vec))
        scores.append(score)

        sim_stats, diff_stats = explain_stats(row, ill_year_mean)
        similar.append(sim_stats)
        dissim.append(diff_stats)

    merged["styleScore_raw"] = scores
    merged["similarStats"]   = similar
    merged["dissimilarStats"] = dissim

    # Filter out Illinois players
    merged = merged[merged["team"] != "Illinois"].copy()

    # Normalise 0‑1
    hi = merged["styleScore_raw"].max() or 1.0
    merged["styleScore"] = merged["styleScore_raw"] / hi

    out_cols = ["player", "team", "role", "styleScore",
                "similarStats", "dissimilarStats"]
    return merged.sort_values("styleScore", ascending=False)[out_cols]


# -------------------------------------------------------------------------
# 7.  Example driver  (adjust file paths)
# -------------------------------------------------------------------------
if __name__ == "__main__":
    YEAR_FILES = {
        2022: "data/team-data-2022.json",
        2023: "data/team-data-2023.json",
        2024: "data/team-data-2024.json",
        2025: "data/team-data-2025.json",
    }

    # 1. Load & fit
    teams_df = concat_team_stats(YEAR_FILES)
    style_model = StyleModel()
    style_model.fit(teams_df)

    # 2. Illinois four‑year mean *in raw feature space* (for explanations)
    illinois_mean_row = (
        teams_df[teams_df["team"] == "Illinois"][FEATURES]
        .mean()
    )

    # 3. Illinois reference vector in PCA space
    ill_ref_vec = illinois_reference(teams_df, style_model)

    # Output teams ranked by similarity to Illinois
    team_vectors = []
    for _, row in teams_df.iterrows():
        if row["team"] == "Illinois":
            continue
        vec = style_model.vector(row)
        if vec is not None:
            sim = to_0_1(cosine(vec, ill_ref_vec))
            team_vectors.append((row["team"], sim))
    # Get the most recent year for each team
    team_latest = {}
    for team, sim in team_vectors:
        if team not in team_latest or sim > team_latest[team]:
            team_latest[team] = sim
    sorted_teams = sorted(team_latest.items(), key=lambda x: x[1], reverse=True)
    print("Top 25 teams most similar to Illinois (by style):")
    for team, sim in sorted_teams[:25]:
        print(f"{team}: {sim:.3f}")

    # Print the rank and similarity of USC
    usc_rank = None
    usc_sim = None
    for idx, (team, sim) in enumerate(sorted_teams, 1):
        if team == "USC":
            usc_rank = idx
            usc_sim = sim
            break
    if usc_rank is not None:
        print(f"\nUSC is ranked #{usc_rank} in similarity to Illinois (similarity: {usc_sim:.3f})")
    else:
        print("\nUSC not found in the team similarity list.")

    # 4. Rank 2025 portal players
    ranked = rank_transfers(
        teams_df,
        "data/transfer-players-2026.json",
        illinois_mean_row,
        style_model,
    )

    print(ranked.head(50).to_string(index=False))
