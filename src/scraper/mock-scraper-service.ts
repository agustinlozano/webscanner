import type { ScrapingConfig, ScrapingResult } from "./scraper-service";

export class MockScraperService {
  async initialize(): Promise<void> {
    console.log("Initializing mock scraper for local development...");
  }

  async scrape(config: ScrapingConfig): Promise<ScrapingResult> {
    console.log(`Mock scraping ${config.name} - ${config.url}`);

    // Simulate some delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      url: config.url,
      name: config.name,
      title: `Mock Title for ${config.name}`,
      content: `This is mock content for ${config.name}. 
        In a real scenario, this would contain the scraped content from ${
          config.url
        }.
        Custom delay: ${config.customDelay || "none"}
        Custom selectors: ${config.customSelectors?.join(", ") || "none"}
        
        This content would be sent to another service for summarization, keyword matching, and storage.`,
      scrapedAt: new Date().toISOString(),
    };
  }

  async close(): Promise<void> {
    console.log("Closing mock scraper...");
  }
}
