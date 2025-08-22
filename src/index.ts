import type { Handler, ScheduledEvent, Context } from "aws-lambda";
import { ScraperService } from "./scraper/scraper-service";
import { MockScraperService } from "./scraper/mock-scraper-service";
import { websiteConfigs } from "./utils/website-configs";
import { postToNotify } from "./utils/notify.api";

export interface ScrapingResponse {
  success: boolean;
  timestamp: string;
  sitesProcessed: number;
  totalSitesConfigured: number;
  results: Array<{
    name: string;
    url: string;
    title: string;
    content: string;
    contentLength: number;
    scrapedAt: string;
    keywords: string[];
    status: "success" | "failed";
    error?: string;
  }>;
  executionTime: number;
}

export const handler: Handler<ScheduledEvent> = async (
  event: ScheduledEvent,
  _: Context
) => {
  const startTime = Date.now();
  console.log("Starting web scraper...");
  console.log("Event:", JSON.stringify(event, null, 2));

  // Use mock scraper for local development, real scraper for production
  const isLocal =
    process.env.IS_OFFLINE === "true" || process.env.NODE_ENV !== "production";
  const scraper = isLocal ? new MockScraperService() : new ScraperService();

  console.log(`Using ${isLocal ? "mock" : "real"} scraper service`);

  const results = [];
  const timestamp = new Date().toISOString();

  try {
    await scraper.initialize();

    for (const config of websiteConfigs) {
      try {
        console.log(`Processing ${config.name}...`);
        const result = await scraper.scrape(config);
        results.push({
          name: result.name,
          url: result.url,
          title: result.title,
          content: result.content,
          contentLength: result.content.length,
          scrapedAt: result.scrapedAt,
          keywords: config.keywords || [],
          status: "success" as const,
        });
        console.log(
          `Successfully scraped ${config.name} - Title: ${result.title}`
        );

        postToNotify({
          error: "",
          message: `Successfully scraped ${config.name}`,
          level: "info",
          timestamp: new Date().toISOString(),
          payload: result,
        });
      } catch (error) {
        console.error(`Error scraping ${config.name}:`, error);
        results.push({
          name: config.name,
          url: config.url,
          title: "",
          content: "",
          contentLength: 0,
          scrapedAt: timestamp,
          keywords: config.keywords || [],
          status: "failed" as const,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        postToNotify({
          error: error instanceof Error ? error.message : "Unknown error",
          message: `Failed to scrape ${config.name}`,
          level: "error",
          timestamp: new Date().toISOString(),
          payload: { name: config.name, url: config.url },
        });

        // Log the error but continue processing other sites
        console.error(
          `Continuing with other sites after error on ${config.name}`
        );
        // Continue with other sites even if one fails
      }
    }

    const executionTime = Date.now() - startTime;
    const successfulScrapes = results.filter(
      (r) => r.status === "success"
    ).length;

    console.log(
      `Scraper execution completed. Processed ${successfulScrapes}/${websiteConfigs.length} sites successfully in ${executionTime}ms.`
    );

    const response: ScrapingResponse = {
      success: true,
      timestamp,
      sitesProcessed: successfulScrapes,
      totalSitesConfigured: websiteConfigs.length,
      results,
      executionTime,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error executing web scraper:", error);
    const executionTime = Date.now() - startTime;

    const response: ScrapingResponse = {
      success: false,
      timestamp,
      sitesProcessed: 0,
      totalSitesConfigured: websiteConfigs.length,
      results,
      executionTime,
    };

    postToNotify({
      error: error instanceof Error ? error.message : "Unknown error",
      message: `Failed to execute web scraper`,
      level: "error",
      timestamp: new Date().toISOString(),
      payload: response,
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        ...response,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  } finally {
    await scraper.close();
  }
};
