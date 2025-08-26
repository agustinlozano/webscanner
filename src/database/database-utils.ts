import { ScrapeRepositoryService } from "./scrape-repository";

/**
 * Database utilities for testing and management
 */
export class DatabaseUtils {
  private dbService = new ScrapeRepositoryService();

  /**
   * Test database connectivity and basic operations
   */
  async testConnection(): Promise<void> {
    try {
      console.log("Testing database connection...");

      // Try to get recent scrapes (this will test read operations)
      const recentScrapes = await this.dbService.getRecentSuccessfulScrapes(1);
      console.log(
        `✓ Successfully connected to database. Found ${recentScrapes.length} recent scrapes.`
      );
    } catch (error) {
      console.error("✗ Database connection test failed:", error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    totalScrapes: number;
    successfulScrapes: number;
    failedScrapes: number;
    uniqueDomains: string[];
    recentScrapes: any[];
  }> {
    try {
      console.log("Gathering database statistics...");

      // Get recent scrapes for analysis
      const recentScrapes = await this.dbService.getRecentSuccessfulScrapes(30);

      const stats = {
        totalScrapes: recentScrapes.length,
        successfulScrapes: recentScrapes.filter((s) => s.status === "success")
          .length,
        failedScrapes: recentScrapes.filter((s) => s.status === "failed")
          .length,
        uniqueDomains: [...new Set(recentScrapes.map((s) => s.domain))],
        recentScrapes: recentScrapes.slice(0, 10), // Latest 10 scrapes
      };

      console.log("Database Statistics:");
      console.log(`- Total scrapes (last 30 days): ${stats.totalScrapes}`);
      console.log(`- Successful: ${stats.successfulScrapes}`);
      console.log(`- Failed: ${stats.failedScrapes}`);
      console.log(`- Unique domains: ${stats.uniqueDomains.length}`);
      console.log(`- Domains: ${stats.uniqueDomains.join(", ")}`);

      return stats;
    } catch (error) {
      console.error("Error gathering database statistics:", error);
      throw error;
    }
  }

  /**
   * Clean up old scrapes (optional for maintenance)
   */
  async cleanupOldScrapes(daysToKeep = 90): Promise<void> {
    console.log(
      `Note: Cleanup functionality would remove scrapes older than ${daysToKeep} days.`
    );
    console.log("This is not implemented yet to prevent accidental data loss.");
    console.log("Implement this carefully with proper backup procedures.");
  }

  /**
   * Save a test scrape result
   */
  async saveTestScrape(): Promise<void> {
    try {
      console.log("Saving test scrape result...");

      const testResult = {
        url: "https://example.com/test",
        name: "Test Website",
        title: "Test Page Title",
        content:
          "This is test content for the database. It contains multiple words to test word counting functionality.",
        scrapedAt: new Date().toISOString(),
      };

      const saved = await this.dbService.saveScrapeResult(testResult, {
        keywords: ["test", "example"],
        executionTime: 1500,
        retryCount: 0,
      });

      console.log("✓ Test scrape saved successfully:", saved.id);
      console.log(`  Domain: ${saved.domain}`);
      console.log(`  Word count: ${saved.wordCount}`);
      console.log(`  Content hash: ${saved.contentHash}`);
    } catch (error) {
      console.error("✗ Failed to save test scrape:", error);
      throw error;
    }
  }
}

// For standalone testing
if (require.main === module) {
  async function runTests() {
    const utils = new DatabaseUtils();

    try {
      await utils.testConnection();
      await utils.saveTestScrape();
      await utils.getDatabaseStats();

      console.log("\n✓ All database tests completed successfully!");
    } catch (error) {
      console.error("\n✗ Database tests failed:", error);
      process.exit(1);
    }
  }

  runTests();
}
