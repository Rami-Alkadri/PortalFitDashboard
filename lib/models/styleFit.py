import numpy as np
from scipy.stats import zscore
from sklearn.metrics.pairwise import cosine_similarity


def calculate_style_fit(portal_players, illinois_roster, style_stats):
    """
    Calculate style fit scores for portal players compared to Illinois team profile.
    Style fit uses cosine similarity between z-scored stat vectors.
    - Each player's stats are z-scored across the portal population
    - Illinois team vector is the mean of their players' z-scored stats
    - Cosine similarity measures how aligned playing styles are (0-100 scale)
    """
    # Step 1: Extract style stats for all portal players
    portal_matrix = np.array([[p.get(stat, 0) for stat in style_stats] for p in portal_players])
    # Step 2: Calculate z-scores across portal population
    portal_z = zscore(portal_matrix, axis=0, ddof=0)
    # Step 3: Build Illinois team vector (mean of z-scored stats for returning players)
    illinois_matrix = np.array([[p.get(stat, 0) for stat in style_stats] for p in illinois_roster if not p.get('leftAfterSeason', False)])
    if illinois_matrix.shape[0] == 0:
        raise ValueError('No returning Illinois players found!')
    illinois_z = zscore(illinois_matrix, axis=0, ddof=0)
    team_vector = illinois_z.mean(axis=0)
    # Step 4: Calculate cosine similarity
    sims = cosine_similarity(portal_z, team_vector.reshape(1, -1)).flatten()
    # Step 5: Convert to 0-100 scale
    style_scores = [(sim + 1) * 50 for sim in sims]
    # Print intermediate results
    print('--- Style Fit Debug ---')
    print('Portal z-score sample:', portal_z[0])
    print('Illinois team vector (z-scored mean):', team_vector)
    print('Sample cosine similarity:', sims[0])
    print('Sample style fit score:', style_scores[0])
    # Return as list of dicts with name and score
    return [
        {'name': p['name'], 'style_fit': score}
        for p, score in zip(portal_players, style_scores)
    ] 