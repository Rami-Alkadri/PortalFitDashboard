#!/usr/bin/env python
"""
plot_fit_score_distribution.py – Visualize and analyze fit scores for all players
usage: python plot_fit_score_distribution.py
"""
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# Fit score weights (must sum to 1)
WEIGHTS = dict(quality=0.34, style=0.33, need=0.33)

def calc_fit(p):
    """0‑1 composite, then scale to 0‑99 integer."""
    q = p.get("qualityScore", 0)
    s = p.get("styleScore",   0)
    n = p.get("needScore",    0)
    raw = (WEIGHTS["quality"]*q +
           WEIGHTS["style"]  *s +
           WEIGHTS["need"]   *n)
    return int(round(raw * 99))

def main():
    inp = "data/transfer-players-2026-merged.json"
    with open(inp) as f:
        players = json.load(f)
    fit_scores = [calc_fit(p) for p in players]
    fit_scores_np = np.array(fit_scores)

    # Statistics
    mean = np.mean(fit_scores_np)
    median = np.median(fit_scores_np)
    std = np.std(fit_scores_np)
    min_score = np.min(fit_scores_np)
    max_score = np.max(fit_scores_np)
    percentiles = np.percentile(fit_scores_np, [10, 25, 50, 75, 90])

    print(f"Fit Score Statistics:")
    print(f"  Count: {len(fit_scores)}")
    print(f"  Mean: {mean:.2f}")
    print(f"  Median: {median:.2f}")
    print(f"  Std Dev: {std:.2f}")
    print(f"  Min: {min_score}")
    print(f"  Max: {max_score}")
    print(f"  10th/25th/50th/75th/90th percentiles: {percentiles}")

    # Plot
    plt.figure(figsize=(10, 6))
    sns.histplot(fit_scores, bins=30, kde=True, color='skyblue', stat='density', edgecolor='black')
    plt.axvline(mean, color='red', linestyle='--', label=f'Mean: {mean:.2f}')
    plt.axvline(median, color='green', linestyle=':', label=f'Median: {median:.2f}')
    plt.title('Distribution of Player Fit Scores')
    plt.xlabel('Fit Score')
    plt.ylabel('Density')
    plt.legend()
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    main() 