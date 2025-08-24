import type { ScrapingConfig } from "@/scraper/scraper-service";

export const websiteConfigs: ScrapingConfig[] = [
  {
    url: "https://www.lamacro.ar/variables",
    name: "🪙 Variables económicas, monetarias y cambiarias del Banco Central de la República Argentina.",
    keywords: [
      "dólar",
      "inflación",
      "tasa de interés",
      "Reservas Internacionales",
      "Tipo de cambio mayorista",
    ],
  },
  // {
  //   url: "https://x.com/EmbAustraliaBA",
  //   name: "Australian Embassy in Argentina - Twitter",
  //   customDelay: 3000, // Wait for Twitter to load content
  //   keywords: [
  //     "subclass 462",
  //     "work and holiday",
  //     "visa",
  //     "argentina",
  //     "application",
  //     "opening",
  //     "closing",
  //     "australia",
  //   ],
  // },
  // {
  //   url: "https://immi.homeaffairs.gov.au/news-media/archive",
  //   name: "Australian Immigration News Archive",
  //   customDelay: 2000, // Wait for page loader
  //   keywords: [
  //     "subclass 462",
  //     "work and holiday",
  //     "visa",
  //     "argentina",
  //     "working holiday maker",
  //     "application",
  //     "changes",
  //     "update",
  //   ],
  // },
];
