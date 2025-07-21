import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

export interface TransferPlayerStats {
  rk: number;
  pick: string;
  player: string;
  playerClass: string;
  height: string;
  recruitRank: string;
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
  drtg: number;
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
  dunks: string;
  dunksPct: number;
  close2: string;
  close2Pct: number;
  far2: string;
  far2Pct: number;
  ft: string;
  ftPct: number;
  twoP: string;
  twoPPct: number;
  threePr: number;
  threeP100: number;
  threeP: string;
  threePPct: number;
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
      let firstRowCellCount = null;
      const results = rows.map((row, rowIdx) => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (rowIdx === 0) firstRowCellCount = cells.length;
        if (cells.length < 10) return null;
        // Skip header rows
        const playerNameCell = cells[4];
        const playerLink = playerNameCell?.querySelector('a');
        const playerName = playerLink?.textContent?.trim() || '';
        const teamCell = cells[6];
        const teamLink = teamCell?.querySelector('a');
        const teamName = teamLink?.textContent?.trim() || '';
        const confCell = cells[7];
        const confLink = confCell?.querySelector('a');
        const confName = confLink?.textContent?.trim() || '';
        if (playerName === 'Player' || teamName === 'Team' || confName === 'Conf') return null;
        
        try {
          let idx = 0;
          const rankText = cells[idx++]?.textContent?.trim() || '';
          const rank = parseInt(rankText);
          const pick = cells[idx++]?.textContent?.trim() || '';
          const posClassCell = cells[idx++];
          const divs = posClassCell.querySelectorAll('div');
          const playerClass = divs[1]?.textContent?.trim() || posClassCell.textContent?.trim() || '';
          const height = cells[idx++]?.textContent?.trim() || '';
          const playerNameCell2 = cells[idx++];
          const playerLink2 = playerNameCell2?.querySelector('a');
          const playerName2 = playerLink2?.textContent?.trim() || '';
          const recruitRank = cells[idx++]?.textContent?.trim() || '';
          const teamCell2 = cells[idx++];
          const teamLink2 = teamCell2?.querySelector('a');
          const teamName2 = teamLink2?.textContent?.trim() || '';
          const confCell2 = cells[idx++];
          const confLink2 = confCell2?.querySelector('a');
          const confName2 = confLink2?.textContent?.trim() || '';
          return {
            rk: rank,
            pick: pick,
            player: playerName2,
            playerClass: playerClass,
            height: height,
            recruitRank: recruitRank,
            team: teamName2,
            conf: confName2,
            g: parseInt(cells[idx++]?.textContent?.trim() || '0') || 0,
            role: cells[idx++]?.textContent?.trim() || '',
            minPct: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            prpg: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            dPrpg: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            bpm: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            obpm: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            dbpm: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            ortg: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            drtg: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0, // hidden D-Rtg
            usg: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            efg: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            ts: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            or: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            dr: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            ast: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            to: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            aTo: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            blk: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            stl: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            ftr: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            fc40: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            // Dunks (2 cells)
            dunks: cells[idx++]?.textContent?.trim() || '',
            dunksPct: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            // Close 2 (2 cells)
            close2: cells[idx++]?.textContent?.trim() || '',
            close2Pct: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            // Far 2 (2 cells)
            far2: cells[idx++]?.textContent?.trim() || '',
            far2Pct: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            // FT (2 cells)
            ft: cells[idx++]?.textContent?.trim() || '',
            ftPct: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            // 2P (2 cells)
            twoP: cells[idx++]?.textContent?.trim() || '',
            twoPPct: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            // 3PR
            threePr: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            // 3P/100
            threeP100: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0,
            // 3P (2 cells)
            threeP: cells[idx++]?.textContent?.trim() || '',
            threePPct: parseFloat(cells[idx++]?.textContent?.trim() || '0') || 0
          };
        } catch (error) {
          return null;
        }
      });
      if (firstRowCellCount !== null) {
        // @ts-ignore
        window.firstRowCellCount = firstRowCellCount;
      }
      return results.filter(Boolean);
    });
    if (players.length > 0) {
      console.log('Sample player:', players[0]);
    }
    // Log the first row cell count for debugging
    if (typeof window !== 'undefined' && (window as any).firstRowCellCount) {
      console.log('First row cell count:', (window as any).firstRowCellCount);
    }
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