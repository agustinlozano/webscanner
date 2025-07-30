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
    console.log("Initializing Playwright browser...");
    this.browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
    });
  }

  async scrape(config: ScrapingConfig): Promise<ScrapingResult> {
    if (!this.browser) {
      throw new Error("Browser not initialized. Call initialize() first.");
    }

    console.log(`Scraping ${config.name} - ${config.url}`);

    const page: Page = await this.browser.newPage();

    try {
      // Navigate to the page
      await page.goto(config.url, {
        waitUntil: "networkidle",
        timeout: 60000,
      });

      // Apply custom delay if specified
      if (config.customDelay) {
        console.log(`Waiting ${config.customDelay}ms for custom delay...`);
        await page.waitForTimeout(config.customDelay);
      }

      // Get page title
      const title = await page.title();

      // Extract content
      let content: string;

      if (config.customSelectors && config.customSelectors.length > 0) {
        // Use custom selectors if provided
        const customContent = await page.evaluate((selectors: string[]) => {
          return selectors
            .map((selector: string) => {
              const element = document.querySelector(selector);
              return element ? element.textContent || "" : "";
            })
            .join("\n");
        }, config.customSelectors);
        content = customContent;
      } else {
        // Default: extract main content
        content = await page.evaluate(() => {
          // Remove script and style elements
          const scripts = document.querySelectorAll("script, style");
          scripts.forEach((el) => el.remove());

          // Try to find main content areas
          const mainSelectors = [
            "main",
            '[role="main"]',
            ".main-content",
            "#main-content",
            "article",
            ".content",
          ];

          for (const selector of mainSelectors) {
            const element = document.querySelector(selector);
            if (element) {
              return element.textContent || "";
            }
          }

          // Fallback to body content
          return document.body.textContent || "";
        });
      }

      return {
        url: config.url,
        name: config.name,
        title,
        content: content.trim(),
        scrapedAt: new Date().toISOString(),
      };
    } finally {
      await page.close();
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
