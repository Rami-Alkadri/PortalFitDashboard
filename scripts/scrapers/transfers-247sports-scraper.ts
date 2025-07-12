import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

export interface TransferPortalEntry {
  name: string;
  rating: number;
  trend: string; // 'HS' or 'T'
  position: string;
  height: string;
  weight: string;
  status: string; // 'Committed', 'Available', 'Withdrawn', etc.
  sourceSchool: string;
  destinationSchool?: string;
  imageUrl?: string;
  playerUrl?: string;
}

class Transfers247SportsScraper {
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

  async scrape247SportsTransferPortal(year: number): Promise<TransferPortalEntry[]> {
    console.log(`🔍 Scraping 247Sports transfer portal for ${year}...`);
    
    if (!this.page) throw new Error('Page not initialized');
    
    // Use the correct URL format
    const url = `https://247sports.com/season/${year}-basketball/transferportaltop/`;
    
    try {
      await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Wait for the page to load completely
      await this.page.waitForTimeout(5000);
      
      // More adaptive "Load More Players" button clicking
      let clickCount = 0;
      const maxClicks = 15; // Increased max clicks
      
      while (clickCount < maxClicks) {
        try {
          const loadMoreButton = await this.page.$('button.action-button.transfer-group-loadMore');
          if (loadMoreButton) {
            // Check if button is visible and enabled
            const isVisible = await loadMoreButton.isVisible();
            const isEnabled = await loadMoreButton.isEnabled();
            
            if (isVisible && isEnabled) {
              await loadMoreButton.click();
              clickCount++;
              console.log(`📄 Loaded more players (${clickCount}/${maxClicks})`);
              await this.page.waitForTimeout(3000); // Wait longer for content to load
            } else {
              console.log(`⚠️ Load More button not visible or enabled after ${clickCount} clicks`);
              break;
            }
          } else {
            console.log(`⚠️ No more "Load More" button found after ${clickCount} clicks`);
            break;
          }
        } catch (error) {
          console.log(`⚠️ Error clicking load more button (attempt ${clickCount + 1}):`, error);
          break;
        }
      }
      
      // Extract transfer portal entries with proper structure
      const transfers = await this.page.$$eval('.transfer-player, .transfer-entry', entries => {
        const results = entries.map(entry => {
          try {
            // Extract name from the player link
            const nameElement = entry.querySelector('h3 a, .player-name a, a[href*="/Player/"]');
            const name = nameElement?.textContent?.trim() || '';
            const playerUrl = nameElement?.getAttribute('href') || '';
            
            // Extract rating from the rating element
            const ratingElement = entry.querySelector('.rating, .player-rating');
            const ratingText = ratingElement?.textContent?.trim() || '';
            const rating = parseFloat(ratingText.replace(/[^\d.]/g, '')) || 0;
            
            // Extract trend (HS or T) from the trend element
            const trendElement = entry.querySelector('.trend, .transfer-trend');
            const trend = trendElement?.textContent?.trim() || '';
            
            // Extract position from the position element
            const positionElement = entry.querySelector('.position, .player-position');
            const position = positionElement?.textContent?.trim() || '';
            
            // Extract height/weight from the bio element
            const bioElement = entry.querySelector('.bio, .player-bio');
            const bio = bioElement?.textContent?.trim() || '';
            const [height, weight] = bio.split(' / ');
            
            // Extract status from the status element
            const statusElement = entry.querySelector('.status, .transfer-status');
            const status = statusElement?.textContent?.trim() || '';
            
            // Extract source school from the transfer info
            const sourceElement = entry.querySelector('.source-school, .transfer-from');
            const sourceSchool = sourceElement?.textContent?.trim() || '';
            
            // Extract destination school from the transfer info
            const destinationElement = entry.querySelector('.destination-school, .transfer-to');
            const destinationSchool = destinationElement?.textContent?.trim() || '';
            
            // Extract image URL
            const imgElement = entry.querySelector('.player-avatar img, .player-image img');
            const imageUrl = imgElement?.getAttribute('src') || '';
            
            return {
              name,
              rating,
              trend,
              position,
              height: height || '',
              weight: weight || '',
              status,
              sourceSchool,
              destinationSchool: destinationSchool || undefined,
              imageUrl,
              playerUrl
            } as TransferPortalEntry;
          } catch (error) {
            return null;
          }
        });
        
        return results.filter((item): item is TransferPortalEntry => item !== null);
      });

      console.log(`✅ Scraped ${transfers.length} transfer entries for ${year}`);
      return transfers;
      
    } catch (error) {
      console.error(`❌ Failed to scrape 247Sports transfers for ${year}:`, error);
      return [];
    }
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
    console.log('🚀 Starting 247Sports transfer portal scraping...');
    
    try {
      await this.init();
      
      // Scrape 247Sports transfer portal for 2022-2025
      for (const year of [2022, 2023, 2024, 2025]) {
        try {
          const transfers = await this.scrape247SportsTransferPortal(year);
          if (transfers.length > 0) {
            await this.saveToFile(transfers, `transfers-247sports-${year}.json`);
          } else {
            console.log(`⚠️ No transfer data found for ${year}`);
          }
        } catch (error) {
          console.error(`❌ Failed to scrape 247Sports transfers for ${year}:`, error);
        }
      }
      
      console.log('✅ 247Sports transfer portal scraping completed!');
      
    } catch (error) {
      console.error('❌ Scraping failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the 247Sports transfer portal scraper
async function main() {
  const scraper = new Transfers247SportsScraper();
  await scraper.scrapeAllYears();
}

if (require.main === module) {
  main().catch(console.error);
}

export { Transfers247SportsScraper }; 