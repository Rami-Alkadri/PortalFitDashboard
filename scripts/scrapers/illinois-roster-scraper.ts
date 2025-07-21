import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

export interface IllinoisRosterPlayer {
  rk: string;
  pick: string;
  number: string;
  class: string;
  height: string;
  name: string;
  recruitRank: string;
  team: string;
  conf: string;
  games: string;
  role: string;
  minPct: string;
  prpg: string;
  dprpg: string;
  bpm: string;
  obpm: string;
  dbpm: string;
  ortg: string;
  drtg: string;
  usg: string;
  efg: string;
  ts: string;
  or: string;
  dr: string;
  ast: string;
  to: string;
  ato: string;
  blk: string;
  stl: string;
  ftr: string;
  fc40: string;
  dunks: string;
  dunksPct: string;
  close2: string;
  close2Pct: string;
  far2: string;
  far2Pct: string;
  ft: string;
  ftPct: string;
  twop: string;
  twopPct: string;
  threepr: string;
  threep100: string;
  threep: string;
  threepPct: string;
  ast2: string;
  reb: string;
  pts: string;
  leftAfterSeason: boolean;
}

class IllinoisRosterScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async init() {
    this.browser = await chromium.launch({ headless: true, slowMo: 1000 });
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

  async scrapeRoster(year: number): Promise<IllinoisRosterPlayer[]> {
    console.log(`🔍 Scraping Illinois roster for ${year}...`);
    if (!this.page) throw new Error('Page not initialized');
    const url = `https://barttorvik.com/team.php?year=${year}&team=Illinois`;
    await this.page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await this.page.waitForTimeout(3000);

    // Extract roster table - need to handle the table structure correctly
    const players = await this.page.$$eval('div.teamFive table tbody tr', (rows) => {
      let firstRowCellCount = null;
      const playerList = Array.from(rows).map((row, rowIdx) => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (rowIdx === 0) firstRowCellCount = cells.length;
        if (cells.length < 10) return null;
        
        let idx = 0;
        
        // 1st cell: rank (hidden)
        const rk = cells[idx++]?.textContent?.trim() || '';
        
        // 2nd cell: pick (hidden)
        const pick = cells[idx++]?.textContent?.trim() || '';
        
        // 3rd cell: jersey/class
        const posClassCell = cells[idx++];
        const divs = posClassCell.querySelectorAll('div');
        const number = divs[0]?.textContent?.replace('#', '').trim() || '';
        const playerClass = divs[1]?.textContent?.trim() || '';
        
        // 4th: height
        const height = cells[idx++]?.textContent?.trim() || '';
        
        // 5th: name (from <a>)
        const nameCell = cells[idx++];
        const a = nameCell?.querySelector('a');
        const name = a ? a.textContent?.trim() : nameCell?.textContent?.trim() || '';
        
        // 6th: recruit rank (hidden)
        const recruitRank = cells[idx++]?.textContent?.trim() || '';
        
        // 7th: team (hidden)
        const teamCell = cells[idx++];
        const teamLink = teamCell?.querySelector('a');
        const team = teamLink ? teamLink.textContent?.trim() : teamCell?.textContent?.trim() || '';
        
        // 8th: conference (hidden)
        const confCell = cells[idx++];
        const confLink = confCell?.querySelector('a');
        const conf = confLink ? confLink.textContent?.trim() : confCell?.textContent?.trim() || '';
        
        // Now extract all the stats in order
        const player: any = {
          rk,
          pick,
          number,
          class: playerClass,
          height,
          name,
          recruitRank,
          team,
          conf,
          games: cells[idx++]?.textContent?.trim() || '',
          role: cells[idx++]?.textContent?.trim() || '',
          minPct: cells[idx++]?.textContent?.trim() || '',
          prpg: cells[idx++]?.textContent?.trim() || '',
          dprpg: cells[idx++]?.textContent?.trim() || '',
          bpm: cells[idx++]?.textContent?.trim() || '',
          obpm: cells[idx++]?.textContent?.trim() || '',
          dbpm: cells[idx++]?.textContent?.trim() || '',
          ortg: cells[idx++]?.textContent?.trim() || '',
          drtg: cells[idx++]?.textContent?.trim() || '', // hidden D-Rtg
          usg: cells[idx++]?.textContent?.trim() || '',
          efg: cells[idx++]?.textContent?.trim() || '',
          ts: cells[idx++]?.textContent?.trim() || '',
          or: cells[idx++]?.textContent?.trim() || '',
          dr: cells[idx++]?.textContent?.trim() || '',
          ast: cells[idx++]?.textContent?.trim() || '',
          to: cells[idx++]?.textContent?.trim() || '',
          ato: cells[idx++]?.textContent?.trim() || '',
          blk: cells[idx++]?.textContent?.trim() || '',
          stl: cells[idx++]?.textContent?.trim() || '',
          ftr: cells[idx++]?.textContent?.trim() || '',
          fc40: cells[idx++]?.textContent?.trim() || '',
          // Dunks (2 cells)
          dunks: cells[idx++]?.textContent?.trim() || '',
          dunksPct: cells[idx++]?.textContent?.trim() || '',
          // Close 2 (2 cells)
          close2: cells[idx++]?.textContent?.trim() || '',
          close2Pct: cells[idx++]?.textContent?.trim() || '',
          // Far 2 (2 cells)
          far2: cells[idx++]?.textContent?.trim() || '',
          far2Pct: cells[idx++]?.textContent?.trim() || '',
          // FT (2 cells)
          ft: cells[idx++]?.textContent?.trim() || '',
          ftPct: cells[idx++]?.textContent?.trim() || '',
          // 2P (2 cells)
          twop: cells[idx++]?.textContent?.trim() || '',
          twopPct: cells[idx++]?.textContent?.trim() || '',
          // 3PR
          threepr: cells[idx++]?.textContent?.trim() || '',
          // 3P/100
          threep100: cells[idx++]?.textContent?.trim() || '',
          // 3P (2 cells)
          threep: cells[idx++]?.textContent?.trim() || '',
          threepPct: cells[idx++]?.textContent?.trim() || '',
          // Final stats
          ast2: cells[idx++]?.textContent?.trim() || '',
          reb: cells[idx++]?.textContent?.trim() || '',
          pts: cells[idx++]?.textContent?.trim() || '',
          leftAfterSeason: false
        };
        
        // Only include if player name is present
        if (player.name) return player;
        return null;
      }).filter(Boolean);
      if (firstRowCellCount !== null) {
        // @ts-ignore
        window.firstRowCellCount = firstRowCellCount;
      }
      return playerList;
    });
    
    if (players.length > 0) {
      console.log('Sample player:', players[0]);
    }
    // Log the first row cell count for debugging
    if (typeof window !== 'undefined' && (window as any).firstRowCellCount) {
      console.log('First row cell count:', (window as any).firstRowCellCount);
    }
    console.log(`✅ Scraped ${players.length} players for ${year}`);
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
    console.log('🚀 Starting Illinois roster scraping...');
    try {
      await this.init();
      for (const year of [2022, 2023, 2024, 2025]) {
        try {
          const roster = await this.scrapeRoster(year);
          await this.saveToFile(roster, `illinois-roster-${year}.json`);
        } catch (error) {
          console.error(`❌ Failed to scrape Illinois roster for ${year}:`, error);
        }
      }
      console.log('✅ Illinois roster scraping completed!');
    } catch (error) {
      console.error('❌ Scraping failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the Illinois roster scraper
async function main() {
  const scraper = new IllinoisRosterScraper();
  await scraper.scrapeAllYears();
}

if (require.main === module) {
  main().catch(console.error);
}

export { IllinoisRosterScraper };