import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

export interface TeamTableData {
  team: string;
  adjOe: number;
  adjDe: number;
  barthag: number;
  record: string;
  wins: number;
  games: number;
  efg: number;
  efgD: number;
  ftRate: number;
  ftRateD: number;
  tovPct: number;
  tovPctD: number;
  oRebPct: number;
  opORebPct: number;
  rawT: number;
  twoPPct: number;
  twoPPctD: number;
  threePPct: number;
  threePPctD: number;
  blkPct: number;
  blkedPct: number;
  astPct: number;
  opAstPct: number;
  threePRate: number;
  threePRateD: number;
  adjT: number;
  avgHgt: number;
  effHgt: number;
  exp: number;
  year: number;
  pake: number;
  pase: number;
  talent: number;
  ftPct: number;
  opFtPct: number;
  pppOff: number;
  pppDef: number;
  eliteSos: number;
}

class TeamDataScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async init() {
    this.browser = await chromium.launch({ 
      headless: true,
      slowMo: 1000
    });
    
    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });
    
    this.page = await context.newPage();
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async scrapeTeamTableData(year: number): Promise<TeamTableData[]> {
    console.log(`🔍 Scraping team table data for ${year}...`);
    
    if (!this.page) throw new Error('Page not initialized');
    
    const url = `https://barttorvik.com/team-tables_each.php?year=${year}&top=0&conlimit=All&venue=All&type=All&yax=3`;
    await this.page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Wait for the page to load completely
    await this.page.waitForTimeout(5000);
    
    // Extract team data from table with proper structure
    const teams = await this.page.$$eval('tr', rows => {
      const results = rows.map(row => { // Don't skip any rows initially
        const cells = row.querySelectorAll('td');
        if (cells.length < 40) return null; // Need at least 40 columns
        
        const cellTexts = Array.from(cells).map(cell => cell.textContent?.trim() || '');
        
        // Skip rows that are clearly not team data
        if (cellTexts[0] === '' || cellTexts[0] === 'Team' || cellTexts[0] === 'Adj OE' ||
            cellTexts[0] === 'Adj DE' || cellTexts[0] === 'Barthag' || cellTexts[0] === 'Record' ||
            cellTexts[0] === 'Wins' || cellTexts[0] === 'Games' || cellTexts[0] === 'eFG' ||
            cellTexts[0] === 'eFG D.' || cellTexts[0] === 'FT Rate' || cellTexts[0] === 'FT Rate D' ||
            cellTexts[0] === 'TOV%' || cellTexts[0] === 'TOV% D' || cellTexts[0] === 'O Reb%' ||
            cellTexts[0] === 'Op OReb%' || cellTexts[0] === 'Raw T' || cellTexts[0] === '2P %' ||
            cellTexts[0] === '2P % D.' || cellTexts[0] === '3P %' || cellTexts[0] === '3P % D.' ||
            cellTexts[0] === 'Blk %' || cellTexts[0] === 'Blked %' || cellTexts[0] === 'Ast %' ||
            cellTexts[0] === 'Op Ast %' || cellTexts[0] === '3P Rate' || cellTexts[0] === '3P Rate D' ||
            cellTexts[0] === 'Adj. T' || cellTexts[0] === 'Avg Hgt.' || cellTexts[0] === 'Eff. Hgt.' ||
            cellTexts[0] === 'Exp.' || cellTexts[0] === 'Year' || cellTexts[0] === 'PAKE' ||
            cellTexts[0] === 'PASE' || cellTexts[0] === 'Talent' || cellTexts[0] === 'FT%' ||
            cellTexts[0] === 'Op. FT%' || cellTexts[0] === 'PPP Off.' || cellTexts[0] === 'PPP Def.' ||
            cellTexts[0] === 'Elite SOS') {
          return null;
        }
        
        // Check if this looks like actual team data - must have a valid team name in second column
        if (!cellTexts[1] || cellTexts[1].length < 2 || cellTexts[1].length > 100) {
          return null;
        }
        
        try {
          return {
            team: cellTexts[1] || '', // Team name is in the second column (index 1)
            adjOe: parseFloat(cellTexts[2]) || 0,
            adjDe: parseFloat(cellTexts[3]) || 0,
            barthag: parseFloat(cellTexts[4]) || 0,
            record: cellTexts[5] || '',
            wins: parseInt(cellTexts[6]) || 0,
            games: parseInt(cellTexts[7]) || 0,
            efg: parseFloat(cellTexts[8]) || 0,
            efgD: parseFloat(cellTexts[9]) || 0,
            ftRate: parseFloat(cellTexts[10]) || 0,
            ftRateD: parseFloat(cellTexts[11]) || 0,
            tovPct: parseFloat(cellTexts[12]) || 0,
            tovPctD: parseFloat(cellTexts[13]) || 0,
            oRebPct: parseFloat(cellTexts[14]) || 0,
            opORebPct: parseFloat(cellTexts[15]) || 0,
            rawT: parseFloat(cellTexts[16]) || 0,
            twoPPct: parseFloat(cellTexts[17]) || 0,
            twoPPctD: parseFloat(cellTexts[18]) || 0,
            threePPct: parseFloat(cellTexts[19]) || 0,
            threePPctD: parseFloat(cellTexts[20]) || 0,
            blkPct: parseFloat(cellTexts[21]) || 0,
            blkedPct: parseFloat(cellTexts[22]) || 0,
            astPct: parseFloat(cellTexts[23]) || 0,
            opAstPct: parseFloat(cellTexts[24]) || 0,
            threePRate: parseFloat(cellTexts[25]) || 0,
            threePRateD: parseFloat(cellTexts[26]) || 0,
            adjT: parseFloat(cellTexts[27]) || 0,
            avgHgt: parseFloat(cellTexts[28]) || 0,
            effHgt: parseFloat(cellTexts[29]) || 0,
            exp: parseFloat(cellTexts[30]) || 0,
            year: parseInt(cellTexts[31]) || 0,
            pake: parseFloat(cellTexts[32]) || 0,
            pase: parseFloat(cellTexts[33]) || 0,
            talent: parseFloat(cellTexts[34]) || 0,
            ftPct: parseFloat(cellTexts[35]) || 0,
            opFtPct: parseFloat(cellTexts[36]) || 0,
            pppOff: parseFloat(cellTexts[37]) || 0,
            pppDef: parseFloat(cellTexts[38]) || 0,
            eliteSos: parseFloat(cellTexts[39]) || 0
          };
        } catch (error) {
          return null;
        }
      });
      
      return results.filter((item): item is TeamTableData => item !== null);
    });

    console.log(`✅ Scraped ${teams.length} teams for ${year}`);
    return teams;
  }

  async saveToFile(data: any, filename: string) {
    const outputDir = 'data';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`💾 Saved data to ${filepath}`);
  }

  async scrapeAllYears() {
    console.log('🚀 Starting team data scraping...');
    
    try {
      await this.init();
      
      // Scrape team table data for 2022-2025
      for (const year of [2022, 2023, 2024, 2025]) {
        try {
          const teamData = await this.scrapeTeamTableData(year);
          await this.saveToFile(teamData, `team-data-${year}.json`);
        } catch (error) {
          console.error(`❌ Failed to scrape team data for ${year}:`, error);
        }
      }
      
      console.log('✅ Team data scraping completed!');
      
    } catch (error) {
      console.error('❌ Scraping failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the team data scraper
async function main() {
  const scraper = new TeamDataScraper();
  await scraper.scrapeAllYears();
}

if (require.main === module) {
  main().catch(console.error);
}

export { TeamDataScraper }; 