"""
summarize_players.py

Usage:
    python summarize_players.py [path/to/players.json] [--model MODEL] [--examples path/to/examples.jsonl]

- Modifies the input JSON file in-place, adding Illini fit summaries for each player lacking them.
- If no path is given, defaults to frontend/public/transfer-players-2026-merged.json
- Requires the environment variable OPENAI_API_KEY to be set.
- Only standard library and openai are required (see requirements.txt).
- Exits non-zero on bad CLI args or missing key.
"""
import argparse
import json
import os
import sys
import time
from typing import List, Dict, Any, Optional

import openai

TEAM_CONTEXT = (
    "Illinois runs 5‑out ‘air‑raid’ spacing (47 % 3PA) with heavy rim pressure & O‑boards.\n"
    "Defense relies on switchable 1‑through‑4 wings and mobile rim protectors.\n"
    "2025‑26 minute gaps: 60 mpg shot‑creating wing/guard, 30 mpg rim‑protecting big, 28 mpg on‑ball creator."
)
RUBRIC = (
    "Return EXACTLY three bullets, ≤ 22 words each.\n"
    "Append ‘ | +’ to a positive bullet, ‘ | –’ to a concern.\n"
    "• 1st bullet: stylistic / positional fit\n"
    "• 2nd: immediate impact or upside\n"
    "• 3rd: key risk or development focus"
)

SYSTEM_MESSAGE = TEAM_CONTEXT

PAUSE_BETWEEN_CALLS = 0.4

MODEL_DEFAULT = "gpt-4o-mini"
DEFAULT_JSON_PATH = "frontend/public/transfer-players-2026-merged.json"


def fail(msg: str, code: int = 1):
    print(f"Error: {msg}", file=sys.stderr)
    sys.exit(code)


def parse_args():
    parser = argparse.ArgumentParser(description="Generate Illini fit summaries for players.")
    parser.add_argument("json_path", nargs="?", default=DEFAULT_JSON_PATH, help="Path to players.json (default: frontend/public/transfer-players-2026-merged.json)")
    parser.add_argument("--model", default=MODEL_DEFAULT, help="OpenAI model (default: gpt-4o-mini)")
    parser.add_argument("--examples", help="Optional path to examples.jsonl")
    return parser.parse_args()


def load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: str, data: Any):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_examples(path: str) -> List[Dict[str, Any]]:
    examples = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                if "player_json" in obj and "expected" in obj:
                    examples.append(obj)
            except Exception:
                continue
    return examples


def build_messages(player: Dict[str, Any], examples: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, str]]:
    messages = [
        {"role": "system", "content": SYSTEM_MESSAGE},
    ]
    if examples:
        for ex in examples:
            messages.append({"role": "user", "content": json.dumps(ex["player_json"], ensure_ascii=False) + "\n" + RUBRIC})
            messages.append({"role": "assistant", "content": ex["expected"]})
    messages.append({"role": "user", "content": json.dumps(player, ensure_ascii=False) + "\n" + RUBRIC})
    return messages


def call_openai(messages: List[Dict[str, str]], model: str) -> str:
    response = openai.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.2,
        max_tokens=256,
    )
    return response.choices[0].message.content.strip()


def parse_bullets(raw: str) -> List[Dict[str, str]]:
    bullets = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        # Remove bullet prefix if present
        if line.startswith("•"):
            line = line[1:].strip()
        # Split off sentiment
        if line.endswith("| +"):
            text = line[:-3].rstrip()
            sentiment = "positive"
        elif line.endswith("| –") or line.endswith("| -"):
            text = line[:-3].rstrip()
            sentiment = "negative"
        else:
            text = line
            sentiment = "positive"  # fallback
        bullets.append({"text": text, "sentiment": sentiment})
    return bullets


def main():
    args = parse_args()
    api_key = API_KEY
    if not isinstance(players, list):
        fail("Input JSON must be an array of player objects.")

    examples = None
    if args.examples:
        try:
            examples = load_examples(args.examples)
        except Exception as e:
            fail(f"Failed to load examples: {e}")

    updated = False
    for idx, player in enumerate(players):
        if "fitSummary" in player and "fitSummaryStruct" in player:
            continue
        name = player.get("name") or player.get("fullName") or f"index {idx}"
        print(f"Generating summary for: {name} ...", flush=True)
        messages = build_messages(player, examples)
        try:
            raw = call_openai(messages, args.model)
        except Exception as e:
            fail(f"OpenAI API error: {e}")
        player["fitSummary"] = raw
        player["fitSummaryStruct"] = parse_bullets(raw)
        updated = True
        time.sleep(PAUSE_BETWEEN_CALLS)

    if updated:
        try:
            save_json(args.json_path, players)
        except Exception as e:
            fail(f"Failed to write JSON: {e}")

if __name__ == "__main__":
    main()
