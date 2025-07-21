#!/usr/bin/env python
"""
add_fit_score.py  – combine Need, Style & Quality → 0‑99 Fit Score
usage: python scripts/model/calc_fit_score.py
"""
import json

# Hard-coded path to the merged players JSON file
FILE_PATH = "data/transfer-players-2026-merged.json"

# Weights must sum to 1
WEIGHTS = {"quality": 0.34, "style": 0.33, "need": 0.33}

def calc_fit(p):
    """0‑1 composite, then scale to 0‑99 integer."""
    q = p.get("qualityScore", 0)
    s = p.get("styleScore",   0)
    n = p.get("needScore",    0)
    raw = (WEIGHTS["quality"] * q +
           WEIGHTS["style"]   * s +
           WEIGHTS["need"]    * n)
    return int(round(raw * 99))


def main():
    # Load players data
    with open(FILE_PATH, 'r') as f:
        players = json.load(f)

    # Calculate fitScore for each player
    for p in players:
        p['fitScore'] = calc_fit(p)

    # Sort by fitScore descending
    players_sorted = sorted(players, key=lambda x: x['fitScore'], reverse=True)

    # Write updated data back to the JSON file
    with open(FILE_PATH, 'w') as f:
        json.dump(players_sorted, f, indent=2)

    print(f"Updated '{FILE_PATH}' with {len(players_sorted)} players sorted by fitScore.")


if __name__ == "__main__":
    main()
