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

    // Try multiple browser launch strategies for Lambda compatibility
    const launchStrategies = [
      // Strategy 1: Minimal args for Lambda
      {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--single-process",
          "--no-zygote",
        ],
        timeout: 30000,
      },
      // Strategy 2: More aggressive flags
      {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--run-all-compositor-stages-before-draw",
          "--disable-background-timer-throttling",
          "--disable-renderer-backgrounding",
          "--disable-backgrounding-occluded-windows",
          "--disable-ipc-flooding-protection",
        ],
        timeout: 30000,
      },
    ];

    let lastError: Error | null = null;

    for (let i = 0; i < launchStrategies.length; i++) {
      try {
        console.log(`Trying browser launch strategy ${i + 1}...`);
        this.browser = await chromium.launch(launchStrategies[i]);

        // Test that browser is actually working
        console.log("Testing browser connectivity...");
        const testPage = await this.browser.newPage();
        await testPage.close();

        console.log("Browser initialized and tested successfully");
        return;
      } catch (error) {
        console.log(`Strategy ${i + 1} failed:`, error);
        lastError = error as Error;

        if (this.browser) {
          try {
            await this.browser.close();
          } catch (closeError) {
            console.log("Error closing failed browser:", closeError);
          }
          this.browser = null;
        }
      }
    }

    throw new Error(
      `All browser launch strategies failed. Last error: ${lastError?.message}`
    );
  }

  async scrape(config: ScrapingConfig): Promise<ScrapingResult> {
    if (!this.browser) {
      throw new Error("Browser not initialized. Call initialize() first.");
    }

    // Check if browser is still connected
    if (!this.browser.isConnected()) {
      console.log("Browser disconnected, reinitializing...");
      await this.initialize();
      if (!this.browser) {
        throw new Error("Failed to reinitialize browser");
      }
    }

    console.log(`Scraping ${config.name} - ${config.url}`);

    let page: Page | null = null;

    try {
      // Create new page with additional error handling
      console.log("Creating new page...");
      page = await this.browser.newPage();
      console.log("New page created successfully");

      // Set shorter timeouts for Lambda
      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      // Set minimal headers
      await page.setExtraHTTPHeaders({
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      });

      // Navigate with single attempt and shorter timeout
      console.log(`Navigating to ${config.url}...`);
      await page.goto(config.url, {
        waitUntil: "domcontentloaded",
        timeout: 25000, // 25 seconds max
      });

      console.log("Navigation successful");

      // Minimal delay for content loading
      const delay = Math.min(config.customDelay || 2000, 3000); // Max 3 seconds
      console.log(`Waiting ${delay}ms for content to load...`);
      await page.waitForTimeout(delay);

      // Get page title
      const title = await page.title();
      console.log(`Page title: ${title}`);

      // Extract content with simpler approach
      let content: string;

      if (config.customSelectors && config.customSelectors.length > 0) {
        content = await page.evaluate((selectors: string[]) => {
          return selectors
            .map((selector: string) => {
              const element = document.querySelector(selector);
              return element ? element.textContent || "" : "";
            })
            .join("\n");
        }, config.customSelectors);
      } else {
        // Simplified content extraction for Lambda
        content = await page.evaluate(() => {
          // Remove unwanted elements
          const unwantedSelectors = [
            "script",
            "style",
            "nav",
            "header",
            "footer",
            ".navigation",
            ".menu",
            ".sidebar",
            ".ads",
          ];

          unwantedSelectors.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el) => el.remove());
          });

          // Try main content selectors
          const contentSelectors = [
            "main",
            "[role='main']",
            ".main-content",
            ".content",
            "#content",
            ".page-content",
            ".article",
            "article",
          ];

          for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              const text = element.textContent || "";
              if (text.trim().length > 100) {
                return text.trim();
              }
            }
          }

          // Fallback to body
          return document.body.textContent || "";
        });
      }

      console.log(`Content extracted: ${content.length} characters`);

      return {
        url: config.url,
        name: config.name,
        title,
        content: content.trim(),
        scrapedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Scraping error for ${config.url}:`, error);
      throw error;
    } finally {
      // Always close the page
      if (page) {
        try {
          await page.close();
          console.log("Page closed");
        } catch (closeError) {
          console.error("Error closing page:", closeError);
        }
      }
    }
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
