import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

export interface TransferPlayerStats {
  rk: number;
  player: string;
  team: string;
  conf: string;
  g: number;
  role: string;
  minPct: number;
  prpg: number;
  dPrpg: number;
  bpm: number;
  obpm: number;
  dbpm: number;
  ortg: number;
  usg: number;
  efg: number;
  ts: number;
  or: number;
  dr: number;
  ast: number;
  to: number;
  aTo: number;
  blk: number;
  stl: number;
  ftr: number;
  fc40: number;
  dunks: number;
  close2: number;
  far2: number;
  ft: number;
  twoP: number;
  threePr: number;
  threeP100: number;
  threeP: number;
}

class TransferPlayersScraper {
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

  async scrapeTransferPlayerStats(year: number): Promise<TransferPlayerStats[]> {
    console.log(`🔍 Scraping transfer player stats for ${year}...`);
    
    if (!this.page) throw new Error('Page not initialized');
    
    // Use hardcoded URLs for each year
    const urls = {
      2022: 'https://barttorvik.com/playerstat.php?link=y&xvalue=trans&year=2022&minmin=0&start=20211101&end=20220501',
      2023: 'https://barttorvik.com/playerstat.php?link=y&xvalue=trans&year=2023&minmin=0&start=20221101&end=20230501',
      2024: 'https://barttorvik.com/playerstat.php?link=y&xvalue=trans&year=2024&minmin=0&start=20231101&end=20240501',
      2025: 'https://barttorvik.com/playerstat.php?link=y&xvalue=trans&year=2025&minmin=0&start=20241101&end=20250501'
    };
    
    const url = urls[year as keyof typeof urls];
    await this.page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Wait for the page to load completely
    await this.page.waitForTimeout(5000);
    
    // Click "Show 100 more" button 6 times to get all players
    for (let i = 0; i < 6; i++) {
      try {
        const showMoreButton = await this.page.$('th#expand a');
        if (showMoreButton) {
          await showMoreButton.click();
          console.log(`📄 Loaded 100 more players (${i + 1}/6)`);
          await this.page.waitForTimeout(2000); // Wait for content to load
        } else {
          console.log(`⚠️ No more "Show 100 more" button found after ${i} clicks`);
          break;
        }
      } catch (error) {
        console.log(`⚠️ Error clicking show more button (attempt ${i + 1}):`, error);
        break;
      }
    }
    
    // Extract player data from table with proper structure
    const players = await this.page.$$eval('tr', rows => {
      const results = rows.map(row => { // Don't skip any rows initially
        const cells = row.querySelectorAll('td');
        if (cells.length < 30) return null; // Need at least 30 columns
        
        // Extract player name from the link in the 5th column (index 4)
        const playerNameCell = cells[4];
        const playerLink = playerNameCell?.querySelector('a');
        const playerName = playerLink?.textContent?.trim() || '';
        
        // Extract team name from the 7th column (index 6)
        const teamCell = cells[6];
        const teamLink = teamCell?.querySelector('a');
        const teamName = teamLink?.textContent?.trim() || '';
        
        // Extract conference from the 8th column (index 7)
        const confCell = cells[7];
        const confLink = confCell?.querySelector('a');
        const confName = confLink?.textContent?.trim() || '';
        
        const cellTexts = Array.from(cells).map(cell => cell.textContent?.trim() || '');
        
        // Skip rows that are clearly not player data
        if (cellTexts[0] === '' || cellTexts[0] === 'Rk' || cellTexts[0] === 'Player' || 
            cellTexts[0] === 'Team' || cellTexts[0] === 'Conf' || cellTexts[0] === 'G' ||
            cellTexts[0] === 'Role' || cellTexts[0] === 'Min%' || cellTexts[0] === 'PRPG!' ||
            cellTexts[0] === 'D-PRPG' || cellTexts[0] === 'BPM' || cellTexts[0] === 'OBPM' ||
            cellTexts[0] === 'DBPM' || cellTexts[0] === 'ORtg' || cellTexts[0] === 'Usg' ||
            cellTexts[0] === 'eFG' || cellTexts[0] === 'TS' || cellTexts[0] === 'OR' ||
            cellTexts[0] === 'DR' || cellTexts[0] === 'Ast' || cellTexts[0] === 'TO' ||
            cellTexts[0] === 'A/TO' || cellTexts[0] === 'Blk' || cellTexts[0] === 'Stl' ||
            cellTexts[0] === 'FTR' || cellTexts[0] === 'FC/40' || cellTexts[0] === 'Dunks' ||
            cellTexts[0] === 'Close 2' || cellTexts[0] === 'Far 2' || cellTexts[0] === 'FT' ||
            cellTexts[0] === '2P' || cellTexts[0] === '3PR' || cellTexts[0] === '3P/100' ||
            cellTexts[0] === '3P') {
          return null;
        }
        
        // Check if this looks like actual player data - must have a valid rank number
        if (!cellTexts[0] || isNaN(parseInt(cellTexts[0])) || parseInt(cellTexts[0]) <= 0) {
          return null;
        }
        
        // Must have a player name
        if (!playerName || playerName.length < 2) {
          return null;
        }
        
        try {
          return {
            rk: parseInt(cellTexts[0]) || 0,
            player: playerName, // Use extracted player name from link
            team: teamName, // Use extracted team name from link
            conf: confName, // Use extracted conference name from link
            g: parseInt(cellTexts[8]) || 0, // Games column
            role: cellTexts[9] || '', // Role column
            minPct: parseFloat(cellTexts[10]) || 0,
            prpg: parseFloat(cellTexts[11]) || 0,
            dPrpg: parseFloat(cellTexts[12]) || 0,
            bpm: parseFloat(cellTexts[13]) || 0,
            obpm: parseFloat(cellTexts[14]) || 0,
            dbpm: parseFloat(cellTexts[15]) || 0,
            ortg: parseFloat(cellTexts[16]) || 0,
            usg: parseFloat(cellTexts[17]) || 0,
            efg: parseFloat(cellTexts[18]) || 0,
            ts: parseFloat(cellTexts[19]) || 0,
            or: parseFloat(cellTexts[20]) || 0,
            dr: parseFloat(cellTexts[21]) || 0,
            ast: parseFloat(cellTexts[22]) || 0,
            to: parseFloat(cellTexts[23]) || 0,
            aTo: parseFloat(cellTexts[24]) || 0,
            blk: parseFloat(cellTexts[25]) || 0,
            stl: parseFloat(cellTexts[26]) || 0,
            ftr: parseFloat(cellTexts[27]) || 0,
            fc40: parseFloat(cellTexts[28]) || 0,
            dunks: parseFloat(cellTexts[29]) || 0,
            close2: parseFloat(cellTexts[30]) || 0,
            far2: parseFloat(cellTexts[31]) || 0,
            ft: parseFloat(cellTexts[32]) || 0,
            twoP: parseFloat(cellTexts[33]) || 0,
            threePr: parseFloat(cellTexts[34]) || 0,
            threeP100: parseFloat(cellTexts[35]) || 0,
            threeP: parseFloat(cellTexts[36]) || 0
          };
        } catch (error) {
          return null;
        }
      });
      
      return results.filter((item): item is TransferPlayerStats => item !== null);
    });

    console.log(`✅ Scraped ${players.length} transfer players for ${year}`);
    return players;
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
    console.log('🚀 Starting transfer players scraping...');
    
    try {
      await this.init();
      
      // Scrape transfer player stats for 2022-2025
      for (const year of [2022, 2023, 2024, 2025]) {
        try {
          const transferPlayers = await this.scrapeTransferPlayerStats(year);
          await this.saveToFile(transferPlayers, `transfer-players-${year}.json`);
        } catch (error) {
          console.error(`❌ Failed to scrape transfer players for ${year}:`, error);
        }
      }
      
      console.log('✅ Transfer players scraping completed!');
      
    } catch (error) {
      console.error('❌ Scraping failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the transfer players scraper
async function main() {
  const scraper = new TransferPlayersScraper();
  await scraper.scrapeAllYears();
}

if (require.main === module) {
  main().catch(console.error);
}

export { TransferPlayersScraper }; 