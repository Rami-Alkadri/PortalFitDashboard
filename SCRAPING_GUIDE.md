# Basketball Data Scraping Guide

This guide outlines how to run the scraping scripts and what data is available.

## Available Data Sources

### 1. Transfer Player Stats (BartTorvik)
- **Source**: BartTorvik.com
- **Years**: 2022-2025
- **Data**: Player statistics for transfer players including scoring, efficiency, and advanced metrics
- **Files**: `data/transfer-players-{year}.json`

### 2. Team Data (BartTorvik)
- **Source**: BartTorvik.com
- **Years**: 2022-2025
- **Data**: Team statistics including offensive/defensive efficiency, shooting percentages, and advanced metrics
- **Files**: `data/team-data-{year}.json`

### 3. Transfer Portal Data (247Sports)
- **Source**: 247Sports.com
- **Years**: 2022-2025
- **Data**: Transfer portal entries with player ratings, positions, schools, and status
- **Files**: `data/transfers-247sports-{year}.json`

## Running the Scrapers

### Individual Scrapers
```bash
# Scrape transfer player stats (BartTorvik)
npm run scrape:transfer-players

# Scrape team data (BartTorvik)
npm run scrape:team-data

# Scrape transfer portal data (247Sports)
npm run scrape:transfers-247sports
```

### All Scrapers (Legacy)
```bash
# Run all scrapers together (not recommended)
npm run scrape-all
```

## Data Structure

### Transfer Player Stats
```typescript
{
  rk: number;           // Rank
  player: string;        // Player name
  team: string;          // Team name
  conf: string;          // Conference
  g: number;            // Games played
  role: string;         // Player role
  minPct: number;       // Minutes percentage
  prpg: number;         // Points per game
  // ... additional stats
}
```

### Team Data
```typescript
{
  team: string;         // Team name
  adjOe: number;        // Adjusted offensive efficiency
  adjDe: number;        // Adjusted defensive efficiency
  barthag: number;      // Barthag rating
  record: string;       // Win-loss record
  wins: number;         // Number of wins
  // ... additional stats
}
```

### Transfer Portal Entries
```typescript
{
  name: string;         // Player name
  rating: number;       // Player rating
  trend: string;        // Rating trend (HS/T)
  position: string;     // Position
  height: string;       // Height
  weight: string;       // Weight
  status: string;       // Transfer status
  sourceSchool: string; // Source school
  destinationSchool?: string; // Destination school (if committed)
  // ... additional fields
}
```

## Notes

- Team data scraping is complete and working well
- Transfer player stats now includes "Show 100 more" button clicking to get all players
- 247Sports scraping has improved error handling and timeout management
- All data is saved to the `data/` directory in JSON format
- Each scraper runs independently to avoid conflicts and allow selective updates 