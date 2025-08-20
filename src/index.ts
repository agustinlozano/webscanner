import type { Handler, ScheduledEvent, Context } from "aws-lambda";
import { ScraperService } from "./scraper/scraper-service";
import { MockScraperService } from "./scraper/mock-scraper-service";
import { websiteConfigs } from "./utils/website-configs";

export const handler: Handler<ScheduledEvent> = async (
  event: ScheduledEvent,
  _: Context
) => {
  console.log("Starting web scanner...");
  console.log("Event:", JSON.stringify(event, null, 2));

  // Use mock scraper for local development, real scraper for production
  const isLocal =
    process.env.IS_OFFLINE === "true" || process.env.NODE_ENV !== "production";
  const scraper = isLocal ? new MockScraperService() : new ScraperService();

  console.log(`Using ${isLocal ? "mock" : "real"} scraper service`);

  try {
    await scraper.initialize();

    const results = [];

    for (const config of websiteConfigs) {
      try {
        console.log(`Processing ${config.name}...`);
        const result = await scraper.scrape(config);
        results.push(result);
        console.log(
          `Successfully scraped ${config.name} - Title: ${result.title}`
        );
      } catch (error) {
        console.error(`Error scraping ${config.name}:`, error);
        // Continue with other sites even if one fails
      }
    }

    console.log(
      `Scanner execution completed successfully. Processed ${results.length} sites.`
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Web scanner executed successfully",
        timestamp: new Date().toISOString(),
        sitesProcessed: results.length,
        results: results.map((r) => ({
          name: r.name,
          url: r.url,
          title: r.title,
          contentLength: r.content.length,
          scrapedAt: r.scrapedAt,
        })),
      }),
    };
  } catch (error) {
    console.error("Error executing web scanner:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error executing web scanner",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  } finally {
    await scraper.close();
  }
};
