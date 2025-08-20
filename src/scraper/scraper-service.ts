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
        // Advanced anti-bot detection avoidance
        "--disable-blink-features=AutomationControlled",
        "--disable-features=VizDisplayCompositor",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "--disable-extensions",
        "--disable-plugins",
        "--disable-images", // Faster loading
        "--disable-javascript", // Try without JS to avoid detection scripts
        "--no-first-run",
        "--disable-default-apps",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
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
      // Set realistic user agent and headers via context
      await page.setExtraHTTPHeaders({
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      });

      // Remove webdriver property and other automation indicators
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", {
          get: () => undefined,
        });

        // Remove automation indicators
        delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Array;
        delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Promise;
        delete (window as any).cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
      });

      // Navigate with retry mechanism
      console.log(`Navigating to ${config.url}...`);
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          await page.goto(config.url, {
            waitUntil: "domcontentloaded",
            timeout: 120000, // 2 minutes timeout
          });
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          if (retryCount > maxRetries) {
            throw error; // Re-throw if max retries exceeded
          }
          console.log(
            `Navigation failed, retrying... (${retryCount}/${maxRetries})`
          );
          await page.waitForTimeout(3000 + Math.random() * 2000); // Random delay 3-5s
        }
      }

      // Apply custom delay with randomization
      const baseDelay = config.customDelay || 2000;
      const randomDelay = baseDelay + Math.random() * 2000; // Add 0-2s random
      console.log(`Waiting ${Math.round(randomDelay)}ms for custom delay...`);
      await page.waitForTimeout(randomDelay);

      // Additional random wait to appear more human-like
      const extraDelay = 1000 + Math.random() * 3000; // 1-4s extra
      console.log(`Additional human-like delay: ${Math.round(extraDelay)}ms`);
      await page.waitForTimeout(extraDelay);

      // Get page title
      const title = await page.title();
      console.log(`Page title: ${title}`);

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
        // Enhanced content extraction for government sites
        content = await page.evaluate(() => {
          // Remove script and style elements
          const scripts = document.querySelectorAll(
            "script, style, nav, header, footer"
          );
          scripts.forEach((el) => el.remove());

          // Try specific selectors for government sites first
          const governmentSelectors = [
            ".content-main",
            ".main-content",
            ".page-content",
            ".article-content",
            ".news-content",
            "[role='main']",
            "main",
            ".content",
            "#content",
            ".article",
            ".news-item",
            ".press-release",
          ];

          let extractedContent = "";

          for (const selector of governmentSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              elements.forEach((element) => {
                const text = element.textContent || "";
                if (text.trim().length > 100) {
                  // Only include substantial content
                  extractedContent += text.trim() + "\n\n";
                }
              });
              if (extractedContent.trim().length > 200) {
                break; // We found good content, stop looking
              }
            }
          }

          // If we didn't find specific content, fall back to body
          if (extractedContent.trim().length < 100) {
            extractedContent = document.body.textContent || "";
          }

          return extractedContent;
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
