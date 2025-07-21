import json
import pandas as pd
from pathlib import Path
import numpy as np

# Import model functions/classes
from quality_score import score_quality
from style_fit import concat_team_stats, StyleModel, illinois_reference, rank_transfers, FEATURES
from team_need import score_transfers


def load_247_data(path):
    df = pd.read_json(path)
    df['name_lc'] = df['name'].str.lower()
    return df

def to_python_type(obj):
    if isinstance(obj, dict):
        return {k: to_python_type(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [to_python_type(v) for v in obj]
    elif isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, (np.bool_)):
        return bool(obj)
    else:
        return obj

def calc_fit(p):
    q = p.get("qualityScore", 0)
    s = p.get("styleScore", 0)
    n = p.get("needScore", 0)
    raw = 0.34 * q + 0.33 * s + 0.33 * n
    return int(round(raw * 99))

def main():
    year = 2025  # 2026 transfer class uses 2025 team/roster data
    data_dir = Path('data')

    # File paths
    transfer_players_fp = data_dir / f'transfer-players-{year+1}.json'
    team_data_fp = data_dir / f'team-data-{year}.json'
    illinois_roster_fp = data_dir / f'illinois-roster-{year}.json'
    transfers_247_fp = data_dir / f'transfers-247sports-{year+1}.json'

    # --- Run models ---
    # 1. Quality Score
    quality_df = score_quality(year, data_dir)
    quality_df['player_lc'] = quality_df['player'].str.lower()

    # 2. Style Fit
    # Need 4 years of team data for PCA
    year_files = {
        y: data_dir / f'team-data-{y}.json' for y in range(year-3, year+1)
    }
    teams_df = concat_team_stats(year_files)
    style_model = StyleModel()
    style_model.fit(teams_df)
    illinois_mean_row = teams_df[teams_df['team'] == 'Illinois'][FEATURES].mean()
    ill_ref_vec = illinois_reference(teams_df, style_model)
    # Patch: pass ill_ref_vec as global for rank_transfers
    import style_fit
    style_fit.ill_ref_vec = ill_ref_vec
    style_df = rank_transfers(
        teams_df,
        transfer_players_fp,
        illinois_mean_row,
        style_model
    )
    style_df['player_lc'] = style_df['player'].str.lower()

    # 3. Team Need
    need_df = score_transfers(illinois_roster_fp, transfer_players_fp)
    need_df['player_lc'] = need_df['player'].str.lower()

    # 4. 247 Sports
    df_247 = load_247_data(transfers_247_fp)

    # 5. Transfer Players (base data)
    base_df = pd.read_json(transfer_players_fp)
    base_df['player_lc'] = base_df['player'].str.lower()

    # --- Merge all data ---
    merged = []
    for _, row in base_df.iterrows():
        player_lc = row['player_lc']
        out = dict(row)
        # Merge model outputs
        q = quality_df[quality_df['player_lc'] == player_lc]
        s = style_df[style_df['player_lc'] == player_lc]
        n = need_df[need_df['player_lc'] == player_lc]
        d247 = df_247[df_247['name_lc'] == player_lc]
        # Add model outputs if found
        if not q.empty:
            out['qualityScore'] = q.iloc[0]['qualityScore']
            out['strengths'] = q.iloc[0]['strengths']
            out['weaknesses'] = q.iloc[0]['weaknesses']
        if not s.empty:
            out['styleScore'] = s.iloc[0]['styleScore']
            out['similarStats'] = s.iloc[0]['similarStats']
            out['dissimilarStats'] = s.iloc[0]['dissimilarStats']
        if not n.empty:
            out['needScore'] = n.iloc[0]['needScore']
            out['matchedTo'] = n.iloc[0]['matchedTo']
        if not d247.empty:
            d = d247.iloc[0]
            out['247_rating'] = d.get('rating')
            out['247_position'] = d.get('position')
            out['247_height'] = d.get('height')
            out['247_weight'] = d.get('weight')
            out['247_status'] = d.get('status')
            out['247_imageUrl'] = d.get('imageUrl')
            out['247_playerUrl'] = d.get('playerUrl')
        merged.append(out)

    # Add fitScore to each player
    for out in merged:
        out["fitScore"] = calc_fit(out)

    # --- Output JSON ---
    output_fp = data_dir / f'transfer-players-2026-merged.json'
    merged_py = [to_python_type(x) for x in merged]
    with open(output_fp, 'w') as f:
        json.dump(merged_py, f, indent=2)
    print(f"Wrote merged player data to {output_fp}")

if __name__ == '__main__':
    main() 