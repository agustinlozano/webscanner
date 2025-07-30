import type { ScrapingConfig } from "@/scraper/scraper-service";

export const websiteConfigs: ScrapingConfig[] = [
  {
    url: "https://x.com/EmbAustraliaBA",
    name: "Australian Embassy in Argentina - Twitter",
    customDelay: 3000, // Wait for Twitter to load content
    keywords: [
      "subclass 462",
      "work and holiday",
      "visa",
      "argentina",
      "application",
      "opening",
      "closing",
      "australia",
    ],
  },
  {
    url: "https://immi.homeaffairs.gov.au/news-media/archive",
    name: "Australian Immigration News Archive",
    customDelay: 2000, // Wait for page loader
    keywords: [
      "subclass 462",
      "work and holiday",
      "visa",
      "argentina",
      "working holiday maker",
      "application",
      "changes",
      "update",
    ],
  },
];
