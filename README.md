# Basketball Dashboard

A comprehensive basketball analytics dashboard with data scraping capabilities and modern web interface.

## 🏗️ Project Structure

```
basketball-dashboard/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Helper functions
│   ├── public/              # Static assets
│   └── styles/              # CSS and styling
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── middleware/      # Express middleware
│   └── tests/               # Backend tests
├── data/                    # Scraped data storage
│   ├── raw/                 # Original scraped data
│   └── processed/           # Processed/transformed data
├── scripts/                 # Data scraping scripts
│   ├── scrapers/            # Web scraping scripts
│   └── utils/               # Scraping utilities
└── docs/                    # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Run scraping scripts to generate data:**
   ```bash
   # Scrape all data sources
   npm run scrape:all
   
   # Or run individual scrapers
   npm run scrape:transfers    # BartTorvik transfer players
   npm run scrape:teams        # BartTorvik team data
   npm run scrape:247sports    # 247Sports transfer portal
   ```

3. **Start development servers:**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:frontend        # Frontend on http://localhost:3000
   npm run dev:backend         # Backend on http://localhost:3001
   ```

## 📊 Data Sources

### BartTorvik
- **Transfer Players**: Comprehensive transfer player statistics
- **Team Data**: Team performance metrics and rankings

### 247Sports
- **Transfer Portal**: Transfer portal data and player information

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start both frontend and backend in development
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only

### Building
- `npm run build` - Build both frontend and backend
- `npm run build:frontend` - Build frontend only
- `npm run build:backend` - Build backend only

### Production
- `npm run start` - Start both frontend and backend in production
- `npm run start:frontend` - Start frontend only
- `npm run start:backend` - Start backend only

### Data Scraping
- `npm run scrape:all` - Run all scraping scripts
- `npm run scrape:transfers` - Scrape BartTorvik transfer data
- `npm run scrape:teams` - Scrape BartTorvik team data
- `npm run scrape:247sports` - Scrape 247Sports transfer portal

## 📁 Key Directories

### Frontend (`/frontend`)
- Modern Next.js application with TypeScript
- Radix UI components for consistent design
- Tailwind CSS for styling
- Redux Toolkit for state management

### Backend (`/backend`)
- Express.js API server
- TypeScript for type safety
- Modular architecture with controllers, services, and routes
- Ready for database integration

### Data (`/data`)
- `raw/` - Original scraped JSON files
- `processed/` - Cleaned and transformed data

### Scripts (`/scripts`)
- Web scraping automation using Playwright
- Modular scraper architecture
- Error handling and retry logic

## 🔧 Configuration

### Environment Variables
Create `.env` files in both frontend and backend directories:

**Backend (.env):**
```env
PORT=3001
NODE_ENV=development
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📚 Documentation

- [Data Documentation](docs/DATA_README.md) - Detailed data structure and analysis
- [Scraping Guide](docs/SCRAPING_GUIDE.md) - How to run and maintain scrapers

## 🎯 Next Steps

1. **Backend Development**
   - Add database integration (PostgreSQL/MongoDB)
   - Implement data processing pipelines
   - Add authentication and authorization
   - Create RESTful API endpoints

2. **Frontend Development**
   - Build dashboard components
   - Implement data visualization
   - Add filtering and search functionality
   - Create responsive design

3. **Data Processing**
   - Implement data cleaning pipelines
   - Add data validation
   - Create data transformation utilities
   - Build analytics models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 