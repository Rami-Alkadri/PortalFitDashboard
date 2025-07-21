#!/usr/bin/env python3
"""
Script to calculate points per game for basketball players using shooting statistics.
Takes the first number from each shooting stat (made shots), multiplies by point value,
then divides by games played.
"""

import json
import sys
from typing import Dict, List, Optional

def parse_shooting_stat(stat_string: str) -> int:
    """
    Parse a shooting stat string like "124-227" and return the first number (made shots).
    
    Args:
        stat_string: String in format "made-attempted"
        
    Returns:
        Number of made shots
    """
    if not stat_string or stat_string == "0-0":
        return 0
    
    try:
        made, _ = stat_string.split('-')
        return int(made)
    except (ValueError, AttributeError):
        print(f"Warning: Could not parse shooting stat '{stat_string}', using 0")
        return 0

def calculate_points_per_game(player_data: Dict) -> Optional[float]:
    """
    Calculate points per game for a player using their shooting statistics.
    
    Point values:
    - Two-point shots: 2 points each
    - Three-point shots: 3 points each  
    - Free throws: 1 point each
    
    Args:
        player_data: Dictionary containing player statistics
        
    Returns:
        Points per game as float, or None if calculation fails
    """
    try:
        # Get shooting stats
        two_p_made = parse_shooting_stat(player_data.get('twoP', '0-0'))
        three_p_made = parse_shooting_stat(player_data.get('threeP', '0-0'))
        ft_made = parse_shooting_stat(player_data.get('ft', '0-0'))
        
        # Get games played
        games = player_data.get('g', 0)
        
        if games == 0:
            print(f"Warning: {player_data.get('player', 'Unknown player')} has 0 games played")
            return None
        
        # Calculate total points
        two_p_points = two_p_made * 2
        three_p_points = three_p_made * 3
        ft_points = ft_made * 1
        
        total_points = two_p_points + three_p_points + ft_points
        
        # Calculate points per game
        ppg = total_points / games
        
        return ppg
        
    except Exception as e:
        print(f"Error calculating PPG for {player_data.get('player', 'Unknown player')}: {e}")
        return None

def main():
    """Main function to process the JSON file and calculate PPG for all players."""
    
    # Load the JSON data
    try:
        with open('frontend/public/transfer-players-2026-merged.json', 'r') as f:
            players = json.load(f)
    except FileNotFoundError:
        print("Error: Could not find transfer-players-2026-merged.json")
        print("Make sure you're running this script from the project root directory")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format: {e}")
        sys.exit(1)
    
    print(f"Processing {len(players)} players...")
    print("-" * 80)
    
    # Calculate PPG for each player
    results = []
    for player in players:
        ppg = calculate_points_per_game(player)
        if ppg is not None:
            player_name = player.get('player', 'Unknown')
            team = player.get('team', 'Unknown')
            games = player.get('g', 0)
            
            # Get shooting stats for display
            two_p = player.get('twoP', '0-0')
            three_p = player.get('threeP', '0-0')
            ft = player.get('ft', '0-0')
            
            results.append({
                'player': player_name,
                'team': team,
                'games': games,
                'ppg': ppg,
                'two_p': two_p,
                'three_p': three_p,
                'ft': ft
            })
    
    # Sort by PPG (highest first)
    results.sort(key=lambda x: x['ppg'], reverse=True)
    
    # Display results
    print(f"{'Rank':<4} {'Player':<25} {'Team':<20} {'Games':<6} {'PPG':<6} {'2P':<10} {'3P':<10} {'FT':<10}")
    print("-" * 100)
    
    for i, result in enumerate(results, 1):
        print(f"{i:<4} {result['player']:<25} {result['team']:<20} {result['games']:<6} "
              f"{result['ppg']:<6.1f} {result['two_p']:<10} {result['three_p']:<10} {result['ft']:<10}")
    
    # Save results to a file
    output_file = 'scripts/ppg_results.json'
    try:
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\nResults saved to {output_file}")
    except Exception as e:
        print(f"Warning: Could not save results to file: {e}")
    
    # Print summary statistics
    if results:
        avg_ppg = sum(r['ppg'] for r in results) / len(results)
        max_ppg = max(r['ppg'] for r in results)
        min_ppg = min(r['ppg'] for r in results)
        
        print(f"\nSummary Statistics:")
        print(f"Average PPG: {avg_ppg:.2f}")
        print(f"Highest PPG: {max_ppg:.2f}")
        print(f"Lowest PPG: {min_ppg:.2f}")
        print(f"Total players processed: {len(results)}")

if __name__ == "__main__":
    main() 