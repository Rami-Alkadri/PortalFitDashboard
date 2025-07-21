#!/usr/bin/env python
"""
add_ppg.py — in‑place update of a player‑list JSON so every dict gets a
`ppg` (points‑per‑game) field.

PPG is derived **only from made shots**:
    points = 2 × made_twos + 3 × made_threes + 1 × made_FTs
    ppg    = points / games_played

The script **modifies the original file**, so be sure it’s version‑controlled
or backed up.

Usage
-----
    python add_ppg.py path/to/players.json

Assumptions
~~~~~~~~~~~
* Each player dict contains:
    - `twoP`, `threeP`, `ft` strings in the form "made‑attempts" (e.g. "124-227").
    - `g` (integer games played).
* The JSON file is either a list of player dicts or a top‑level dict with a
  `players` list inside. Adjust as needed.

Tested on Python 3.8+.
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _made(field: str | None) -> int:
    """Return the **made** component from a "made-attempts" string."""
    if not field:
        return 0
    try:
        made, *_ = field.split("-")
        return int(made)
    except (ValueError, AttributeError):
        return 0


def _add_ppg(player: dict) -> dict:
    """Compute and attach `ppg` to a single player dict."""
    twos   = _made(player.get("twoP"))
    threes = _made(player.get("threeP"))
    fts    = _made(player.get("ft"))

    games = player.get("g") or 1  # Fallback to 1 to avoid ZeroDivisionError.

    points = 2 * twos + 3 * threes + fts
    player["ppg"] = round(points / games, 1)
    return player

# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main() -> None:
    if len(sys.argv) != 2:
        print("Usage: python add_ppg.py path/to/players.json")
        sys.exit(1)

    path = Path(sys.argv[1])
    if not path.exists():
        sys.exit(f"Error: {path} not found.")

    data = json.loads(path.read_text())

    if isinstance(data, list):
        data = [_add_ppg(p) for p in data]
    elif isinstance(data, dict):
        # If wrapped in a parent dict (e.g. {"players": [...]})
        if "players" in data and isinstance(data["players"], list):
            data["players"] = [_add_ppg(p) for p in data["players"]]
        else:
            sys.exit("Cannot find player list in JSON. Expected list or dict with 'players' key.")
    else:
        sys.exit("Unsupported JSON structure. Must be list or dict.")

    path.write_text(json.dumps(data, indent=2))
    print(f"✔ Updated {path} with fresh 'ppg' values.")


if __name__ == "__main__":
    main()
