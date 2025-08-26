import { Entity } from "electrodb";
import { DynamoDB } from "aws-sdk";
import { ScrapingResult } from "../scraper/scraper-service";

// Enhanced interface for database storage
export interface ScrapeRepositoryRecord extends ScrapingResult {
  id: string; // Unique identifier for each scrape
  domain: string; // Extracted domain for easier querying
  contentHash: string; // Hash of content to detect changes
  wordCount: number; // Number of words in content
  status: "success" | "failed";
  keywords?: string[]; // Keywords for this site
  error?: string; // Error message if scraping failed
  executionTime?: number; // Time taken to scrape this site
  retryCount?: number; // Number of retries for this scrape
  lastModified?: string; // When content was last modified (if available)
}

// Create DynamoDB client
const client = new DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || "us-east-2",
});

// Define the ElectroDB entity
const ScrapedWebsitesEntity = new Entity(
  {
    model: {
      entity: "ScrapedWebsite",
      version: "1",
      service: "WebScrapingService",
    },
    attributes: {
      id: {
        type: "string",
        required: true,
        readOnly: true,
      },
      url: {
        type: "string",
        required: true,
      },
      name: {
        type: "string",
        required: true,
      },
      domain: {
        type: "string",
        required: true,
      },
      title: {
        type: "string",
        required: true,
      },
      content: {
        type: "string",
        required: true,
      },
      contentHash: {
        type: "string",
        required: true,
      },
      wordCount: {
        type: "number",
        required: true,
      },
      scrapedAt: {
        type: "string",
        required: true,
      },
      status: {
        type: ["success", "failed"] as const,
        required: true,
      },
      keywords: {
        type: "list",
        items: {
          type: "string",
        },
      },
      error: {
        type: "string",
      },
      executionTime: {
        type: "number",
      },
      retryCount: {
        type: "number",
        default: 0,
      },
      lastModified: {
        type: "string",
      },
    },
    indexes: {
      primary: {
        pk: {
          // Partition by domain to group scrapes by website
          field: "pk",
          composite: ["domain"],
        },
        sk: {
          // Sort by scrape timestamp for chronological order
          field: "sk",
          composite: ["scrapedAt"],
        },
      },
      byUrl: {
        index: "gsi1pk-gsi1sk-index",
        pk: {
          field: "gsi1pk",
          composite: ["url"],
        },
        sk: {
          field: "gsi1sk",
          composite: ["scrapedAt"],
        },
      },
      byName: {
        index: "gsi2pk-gsi2sk-index",
        pk: {
          field: "gsi2pk",
          composite: ["name"],
        },
        sk: {
          field: "gsi2sk",
          composite: ["scrapedAt"],
        },
      },
    },
  },
  {
    client,
    table: process.env.SCRAPPED_WEBSITES_TABLE || "ScrappedWebsites",
  }
);

export class ScrapeRepositoryService {
  private entity = ScrapedWebsitesEntity;

  /**
   * Save a scraping result to the database
   */
  async saveScrapeResult(
    result: ScrapingResult,
    additionalData?: {
      keywords?: string[];
      error?: string;
      executionTime?: number;
      retryCount?: number;
    }
  ): Promise<ScrapeRepositoryRecord> {
    try {
      // Generate unique ID
      const id = this.generateId(result.url, result.scrapedAt);

      // Extract domain from URL
      const domain = this.extractDomain(result.url);

      // Generate content hash for change detection
      const contentHash = this.generateContentHash(result.content);

      // Count words in content
      const wordCount = this.countWords(result.content);

      const record: ScrapeRepositoryRecord = {
        id,
        domain,
        contentHash,
        wordCount,
        status: "success",
        ...result,
        ...additionalData,
      };

      const savedRecord = await this.entity.create(record).go();

      console.log(`Saved scrape result for ${result.name} (${result.url})`);
      return savedRecord.data;
    } catch (error) {
      console.error("Error saving scrape result:", error);
      throw new Error(`Failed to save scrape result: ${error}`);
    }
  }

  /**
   * Save a failed scraping attempt
   */
  async saveFailedScrape(
    url: string,
    name: string,
    error: string,
    additionalData?: {
      keywords?: string[];
      executionTime?: number;
      retryCount?: number;
    }
  ): Promise<ScrapeRepositoryRecord> {
    try {
      const scrapedAt = new Date().toISOString();
      const id = this.generateId(url, scrapedAt);
      const domain = this.extractDomain(url);

      const record: ScrapeRepositoryRecord = {
        id,
        url,
        name,
        domain,
        title: "",
        content: "",
        contentHash: "",
        wordCount: 0,
        scrapedAt,
        status: "failed",
        error,
        ...additionalData,
      };

      const savedRecord = await this.entity.create(record).go();

      console.log(`Saved failed scrape for ${name} (${url})`);
      return savedRecord.data;
    } catch (dbError) {
      console.error("Error saving failed scrape:", dbError);
      throw new Error(`Failed to save failed scrape: ${dbError}`);
    }
  }

  /**
   * Get latest scrape results for a specific domain
   */
  async getLatestByDomain(
    domain: string,
    limit = 10
  ): Promise<ScrapeRepositoryRecord[]> {
    try {
      const results = await this.entity.query
        .primary({ domain })
        .go({ limit, order: "desc" });

      return results.data;
    } catch (error) {
      console.error(
        `Error getting latest scrapes for domain ${domain}:`,
        error
      );
      throw new Error(`Failed to get latest scrapes for domain: ${error}`);
    }
  }

  /**
   * Get scrape history for a specific URL
   */
  async getHistoryByUrl(
    url: string,
    limit = 20
  ): Promise<ScrapeRepositoryRecord[]> {
    try {
      const results = await this.entity.query
        .byUrl({ url })
        .go({ limit, order: "desc" });

      return results.data;
    } catch (error) {
      console.error(`Error getting history for URL ${url}:`, error);
      throw new Error(`Failed to get URL history: ${error}`);
    }
  }

  /**
   * Get scrape history for a specific site name
   */
  async getHistoryByName(
    name: string,
    limit = 20
  ): Promise<ScrapeRepositoryRecord[]> {
    try {
      const results = await this.entity.query
        .byName({ name })
        .go({ limit, order: "desc" });

      return results.data;
    } catch (error) {
      console.error(`Error getting history for name ${name}:`, error);
      throw new Error(`Failed to get name history: ${error}`);
    }
  }

  /**
   * Check if content has changed since last scrape
   */
  async hasContentChanged(
    url: string,
    currentContent: string
  ): Promise<boolean> {
    try {
      const history = await this.getHistoryByUrl(url, 1);

      if (history.length === 0) {
        return true; // No previous scrape, so consider it changed
      }

      const lastScrape = history[0];
      const currentHash = this.generateContentHash(currentContent);

      return lastScrape.contentHash !== currentHash;
    } catch (error) {
      console.error(`Error checking content changes for ${url}:`, error);
      // If we can't check, assume it changed to be safe
      return true;
    }
  }

  /**
   * Get successful scrapes from the last N days
   */
  async getRecentSuccessfulScrapes(
    days = 7
  ): Promise<ScrapeRepositoryRecord[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffISO = cutoffDate.toISOString();

      // Note: This is a simplified query. For production, you might want to use a different index
      // or scan with filters for better performance
      const results = await this.entity.scan
        .where(
          ({ status, scrapedAt }, { eq, gte }) =>
            `${eq(status, "success")} AND ${gte(scrapedAt, cutoffISO)}`
        )
        .go();

      return results.data.sort((a, b) =>
        b.scrapedAt.localeCompare(a.scrapedAt)
      );
    } catch (error) {
      console.error(`Error getting recent successful scrapes:`, error);
      throw new Error(`Failed to get recent successful scrapes: ${error}`);
    }
  }

  // Private utility methods
  private generateId(url: string, timestamp: string): string {
    // Create a unique ID based on URL and timestamp
    const urlHash = this.simpleHash(url);
    const timeHash = this.simpleHash(timestamp);
    return `${urlHash}-${timeHash}`;
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, "");
    } catch (error) {
      console.warn(`Invalid URL format: ${url}`);
      return "unknown-domain";
    }
  }

  private generateContentHash(content: string): string {
    // Simple hash function for content comparison
    return this.simpleHash(content.trim().toLowerCase());
  }

  private countWords(content: string): number {
    if (!content || content.trim().length === 0) return 0;
    return content.trim().split(/\s+/).length;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  }
}
