import { Browser, Page, chromium } from "playwright";

export interface ScrapingConfig {
  url: string;
  name: string;
  customDelay?: number;
  customSelectors?: string[];
  keywords?: string[];
}

export interface ScrapingResult {
  url: string;
  name: string;
  title: string;
  content: string;
  scrapedAt: string;
}

export class ScraperService {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    console.log("Initializing Playwright browser for Lambda...");

    // Single, more robust strategy based on AWS Lambda best practices
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          // Essential for Lambda
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",

          // Prevent crashes
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",

          // Single process mode for Lambda
          "--single-process",
          "--no-zygote",

          // Reduce memory usage
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-ipc-flooding-protection",
          "--disable-extensions",
          "--disable-plugins",
          "--disable-images",
          "--disable-javascript", // Try without JS first for simple content

          // Set reasonable window size
          "--window-size=1280,720",
        ],
        timeout: 60000, // Increased timeout
      });

      console.log("Browser launched successfully");

      // Don't test with a page - keep it simple
      console.log("Browser ready for scraping");
    } catch (error) {
      console.error("Browser launch failed:", error);
      throw new Error(`Failed to initialize browser: ${error}`);
    }
  }

  async scrape(config: ScrapingConfig): Promise<ScrapingResult> {
    if (!this.browser) {
      throw new Error("Browser not initialized. Call initialize() first.");
    }

    console.log(`Scraping ${config.name} - ${config.url}`);

    let page: Page | null = null;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        // Create new page with retry logic
        console.log(`Creating new page (attempt ${retryCount + 1})...`);
        page = await this.browser.newPage();
        console.log("New page created successfully");

        // Set aggressive timeouts for Lambda
        page.setDefaultTimeout(20000);
        page.setDefaultNavigationTimeout(20000);

        // Set minimal headers
        await page.setExtraHTTPHeaders({
          "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        });

        // Navigate with timeout
        console.log(`Navigating to ${config.url}...`);
        await page.goto(config.url, {
          waitUntil: "domcontentloaded",
          timeout: 15000, // Reduced timeout
        });

        console.log("Navigation successful");

        // Minimal delay
        const delay = Math.min(config.customDelay || 1000, 2000); // Max 2 seconds
        console.log(`Waiting ${delay}ms for content to load...`);
        await page.waitForTimeout(delay);

        // Get page title
        const title = await page.title();
        console.log(`Page title: ${title}`);

        // Extract content - simplified for Lambda
        const content = await page.evaluate(() => {
          // Remove scripts and styles
          const unwanted = document.querySelectorAll(
            "script, style, nav, header, footer"
          );
          unwanted.forEach((el) => el.remove());

          // Get main content
          const main =
            document.querySelector("main") ||
            document.querySelector("[role='main']") ||
            document.querySelector(".main-content") ||
            document.querySelector(".content") ||
            document.body;

          return main ? main.textContent?.trim() || "" : "";
        });

        console.log(`Content extracted: ${content.length} characters`);

        const result = {
          url: config.url,
          name: config.name,
          title,
          content: content.trim(),
          scrapedAt: new Date().toISOString(),
        };

        // Close page before returning
        if (page) {
          await page.close();
          console.log("Page closed successfully");
        }

        return result;
      } catch (error) {
        console.error(`Scraping attempt ${retryCount + 1} failed:`, error);

        // Close page if it exists
        if (page) {
          try {
            await page.close();
          } catch (closeError) {
            console.error("Error closing page:", closeError);
          }
          page = null;
        }

        retryCount++;

        if (retryCount > maxRetries) {
          throw error;
        }

        // Wait before retry
        console.log(`Retrying in 2 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Check browser status before retry
        if (!this.browser?.isConnected()) {
          console.log("Browser disconnected, reinitializing...");
          await this.initialize();
        }
      }
    }

    throw new Error("Max retries exceeded");
  }

  async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        console.log("Browser closed");
        this.browser = null;
      } catch (error) {
        console.error("Error closing browser:", error);
      }
    }
  }
}
