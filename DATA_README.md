# Basketball Data Overview

This document describes all the basketball data we have available for model building and analysis.

## Data Sources Overview

We have scraped data from two primary sources across 4 years (2022-2025):

1. **BartTorvik.com** - Advanced basketball analytics
2. **247Sports.com** - Transfer portal and recruiting data

## Available Datasets

### 1. Transfer Player Statistics (BartTorvik)
**Files**: `data/transfer-players-{year}.json` (2022-2025)
**Records**: ~650 players per year
**Source**: BartTorvik.com transfer player stats

#### Key Fields:
```typescript
{
  rk: number;           // Player rank
  player: string;        // Player name
  team: string;          // Current team
  conf: string;          // Conference
  g: number;            // Games played
  role: string;         // Position/role (e.g., "Scoring PG")
  minPct: number;       // Minutes percentage
  prpg: number;         // Points per game
  dPrpg: number;        // Defensive points per game
  bpm: number;          // Box Plus/Minus
  obpm: number;         // Offensive BPM
  dbpm: number;         // Defensive BPM
  ortg: number;         // Offensive rating
  usg: number;          // Usage rate
  efg: number;          // Effective field goal %
  ts: number;           // True shooting %
  or: number;           // Offensive rebound %
  dr: number;           // Defensive rebound %
  ast: number;          // Assist %
  to: number;           // Turnover %
  aTo: number;          // Assist-to-turnover ratio
  blk: number;          // Block %
  stl: number;          // Steal %
  ftr: number;          // Free throw rate
  fc40: number;         // Fouls committed per 40
  dunks: number;        // Dunk attempts
  close2: number;       // Close 2-point %
  far2: number;         // Far 2-point %
  ft: number;           // Free throw %
  twoP: number;         // 2-point %
  threePr: number;      // 3-point rate
  threeP100: number;    // 3-pointers per 100
  threeP: number;       // 3-point %
}
```

### 2. Team Statistics (BartTorvik)
**Files**: `data/team-data-{year}.json` (2022-2025)
**Records**: ~350+ teams per year
**Source**: BartTorvik.com team efficiency data

#### Key Fields:
```typescript
{
  team: string;         // Team name
  adjOe: number;        // Adjusted offensive efficiency
  adjDe: number;        // Adjusted defensive efficiency
  barthag: number;      // Overall team rating
  record: string;       // Win-loss record
  wins: number;         // Number of wins
  games: number;        // Total games
  efg: number;          // Effective field goal %
  efgD: number;         // Opponent eFG%
  ftRate: number;       // Free throw rate
  ftRateD: number;      // Opponent FT rate
  tovPct: number;       // Turnover %
  tovPctD: number;      // Opponent turnover %
  oRebPct: number;      // Offensive rebound %
  opORebPct: number;    // Opponent offensive rebound %
  rawT: number;         // Raw tempo
  twoPPct: number;      // 2-point %
  twoPPctD: number;     // Opponent 2-point %
  threePPct: number;    // 3-point %
  threePPctD: number;   // Opponent 3-point %
  blkPct: number;       // Block %
  blkedPct: number;     // Blocked %
  astPct: number;       // Assist %
  opAstPct: number;     // Opponent assist %
  threePRate: number;   // 3-point rate
  threePRateD: number;  // Opponent 3-point rate
  adjT: number;         // Adjusted tempo
  avgHgt: number;       // Average height
  effHgt: number;       // Effective height
  exp: number;          // Experience
  year: number;         // Season year
  pake: number;         // PAKE rating
  pase: number;         // PASE rating
  talent: number;       // Talent rating
  ftPct: number;        // Free throw %
  opFtPct: number;      // Opponent FT%
  pppOff: number;       // Points per possession (offense)
  pppDef: number;       // Points per possession (defense)
  eliteSos: number;     // Elite strength of schedule
}
```

### 3. Transfer Portal Data (247Sports)
**Files**: `data/transfers-247sports-{year}.json` (2022-2025)
**Records**: 92-528 entries per year
**Source**: 247Sports.com transfer portal

#### Key Fields:
```typescript
{
  name: string;         // Player name
  rating: number;       // Player rating (0.0-1.0)
  trend: string;        // Rating trend ("HS", "T", etc.)
  position: string;     // Position (PG, SG, SF, PF, C)
  height: string;       // Height (e.g., "6-4")
  weight: string;       // Weight (e.g., "175")
  status: string;       // Transfer status
  sourceSchool: string; // School transferring from
  destinationSchool?: string; // School transferring to (if committed)
  imageUrl?: string;    // Player image URL
  playerUrl?: string;   // Player profile URL
}
```

## Data Relationships & Potential Models

### 1. Transfer Success Prediction Model
**Input**: Transfer player stats + team context
**Output**: Success metrics (minutes, efficiency, team impact)
**Features**:
- Player efficiency metrics (BPM, ORtg, eFG%)
- Team context (team efficiency, conference strength)
- Transfer portal rating and trend
- Position-specific metrics

### 2. Team Performance Prediction Model
**Input**: Team statistics + transfer additions
**Output**: Season performance predictions
**Features**:
- Team efficiency metrics
- Transfer portal additions/subtractions
- Conference strength
- Historical performance trends

### 3. Transfer Portal Value Model
**Input**: Player stats + transfer portal data
**Output**: Transfer value/impact prediction
**Features**:
- Player efficiency vs. transfer rating
- Position scarcity
- Team needs vs. player strengths
- Conference movement patterns

### 4. Player Development Model
**Input**: Year-over-year player stats
**Output**: Development trajectory prediction
**Features**:
- Efficiency improvements
- Role changes
- Team context changes
- Transfer impact on development

## Data Quality Notes

### Strengths:
- **Comprehensive coverage**: 4 years of data across multiple sources
- **Advanced metrics**: BartTorvik provides sophisticated analytics
- **Transfer context**: Links player performance to transfer decisions
- **Team context**: Can analyze how transfers affect team performance

### Limitations:
- **Transfer portal data**: May be incomplete for some years
- **Player matching**: Names may not match perfectly across sources
- **Missing data**: Some fields may be empty or inconsistent
- **Time lag**: Transfer portal data may not reflect final decisions

## Potential Model Applications

### 1. **Recruiting Analytics**
- Predict which transfers will be most successful
- Identify undervalued players in transfer portal
- Optimize transfer portal strategy for teams

### 2. **Player Development**
- Track player improvement over time
- Identify factors that lead to successful transfers
- Predict career trajectories

### 3. **Team Strategy**
- Analyze how transfers impact team performance
- Identify optimal transfer portal strategies
- Predict team success based on transfer additions

### 4. **Market Analysis**
- Identify transfer portal trends
- Analyze conference movement patterns
- Predict transfer portal activity

## Data Processing Considerations

### Joining Data Sources:
- **Player matching**: Use name + team combinations
- **Temporal alignment**: Match transfer decisions with subsequent performance
- **Context preservation**: Maintain team and conference context

### Feature Engineering Opportunities:
- **Efficiency ratios**: Create derived efficiency metrics
- **Transfer impact**: Calculate pre/post transfer performance changes
- **Team context**: Normalize player stats by team strength
- **Conference strength**: Create conference difficulty metrics

### Validation Strategies:
- **Temporal split**: Use 2022-2023 for training, 2024-2025 for validation
- **Cross-validation**: Use different years for different folds
- **Out-of-sample testing**: Test on completely new transfer cycles

This data provides a rich foundation for building sophisticated basketball analytics models, particularly around transfer portal dynamics and player development. 