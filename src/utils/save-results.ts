import { writeFileSync } from "fs";
import { join } from "path";
import { websiteConfigs } from "./website-configs";

interface ScrapingResult {
  url: string;
  name: string;
  title: string;
  content: string;
  scrapedAt: string;
}

export function saveResultsToFiles(
  results: ScrapingResult[],
  timestamp: string
) {
  const baseDir = "/tmp"; // Use /tmp in Lambda, current dir locally
  const dateStr = new Date(timestamp).toISOString().split("T")[0]; // YYYY-MM-DD
  const timeStr = new Date(timestamp)
    .toISOString()
    .split("T")[1]
    .split(".")[0]
    .replace(/:/g, "-"); // HH-MM-SS

  // Save detailed JSON file
  const jsonFilename = `scan-results-${dateStr}-${timeStr}.json`;
  const jsonData = {
    timestamp,
    sitesProcessed: results.length,
    results: results.map((r) => ({
      name: r.name,
      url: r.url,
      title: r.title,
      content: r.content,
      contentLength: r.content.length,
      scrapedAt: r.scrapedAt,
      keywords: websiteConfigs.find((c) => c.url === r.url)?.keywords || [],
    })),
  };

  try {
    writeFileSync(
      join(baseDir, jsonFilename),
      JSON.stringify(jsonData, null, 2)
    );
    console.log(`✅ Saved detailed results to: ${jsonFilename}`);
  } catch (error) {
    console.error("Error saving JSON file:", error);
  }

  // Save readable TXT file
  const txtFilename = `scan-results-${dateStr}-${timeStr}.txt`;
  let txtContent = `WEB SCANNER RESULTS\n`;
  txtContent += `===================\n\n`;
  txtContent += `Scan Date: ${new Date(timestamp).toLocaleString()}\n`;
  txtContent += `Sites Processed: ${results.length}\n\n`;

  results.forEach((result, index) => {
    const config = websiteConfigs.find((c) => c.url === result.url);
    txtContent += `${index + 1}. ${result.name}\n`;
    txtContent += `${"=".repeat(result.name.length + 3)}\n`;
    txtContent += `URL: ${result.url}\n`;
    txtContent += `Title: ${result.title}\n`;
    txtContent += `Scraped: ${new Date(result.scrapedAt).toLocaleString()}\n`;
    txtContent += `Content Length: ${result.content.length} characters\n`;
    txtContent += `Keywords: ${config?.keywords?.join(", ") || "None"}\n\n`;

    txtContent += `CONTENT:\n`;
    txtContent += `---------\n`;
    txtContent += result.content.substring(0, 1000); // First 1000 chars
    if (result.content.length > 1000) {
      txtContent += `\n... (truncated, full content in JSON file)`;
    }
    txtContent += `\n\n${"=".repeat(80)}\n\n`;
  });

  try {
    writeFileSync(join(baseDir, txtFilename), txtContent);
    console.log(`✅ Saved readable results to: ${txtFilename}`);
  } catch (error) {
    console.error("Error saving TXT file:", error);
  }

  return { jsonFilename, txtFilename };
}
