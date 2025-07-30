# Web Scanner

A daily scanner for specific web pages to generate summaries and analyze/categorize their content.

## What do I want to stay up to date with first?

As an Argentinian interested in Work & Travel opportunities in Australia, I want to stay updated with news published on official websites. This includes visa updates for Argentinians, application dates for relevant programs, and any other information important to young Argentinians looking to travel and work abroad. The **Subclass 462 visa** is key, as it's the one Argentinians use to travel and work legally in Australia.

## This stack

1. Scraping: Playwright
2. Scheduling: EventBridge
3. Content summarization: OpenAI model
4. Keyword/topic matching: To be defined, but we will not use embeddings for now.
5. Storage: DynamoDB first, and later S3.
6. Infrastructure: AWS Lambda + EventBridge + S3 + DynamoDB + Secrets Manager (not sure if we need this one yet). Using the Serverless Framework.

### 🚀 Recommended implementation: Lambda Docker + Playwright

We will use the **official Playwright Docker image**, which already includes Chromium and all required dependencies. The recommended flow looks like this:

1. **Use the official base image**:

   ```
   Dockerfile
   CopyEdit
   FROM mcr.microsoft.com/playwright:v1.54.0-noble
   ```

2. **Construir la imagen Docker localmente** y subirla a **Amazon ECR**:
   - Create a repository in ECR.
   - Authenticate and push the image (`docker push`).
3. **Create the Lambda function** that uses this image from ECR as its source.

## Where do we start?

We will begin by scanning and summarizing two pages:

- https://x.com/EmbAustraliaBA (Australian Embassy in Argentina)
- https://immi.homeaffairs.gov.au/news-media/archive (Note: this page loads content after an initial loader.)

## 🔨 Requirements

- The sites should be scanned daily.
- The project should support configurable keywords and topics to help the AI model detect when a page strongly matches our interests.
- Each page should have its own configuration. This way, the project can be extended in the future to scan different types of content beyond visas and travel.
- The structure should be clean and scalable, in case the project grows.

### Other technology requirements

- We might eventually need an API server. If that happens, do not use raw TypeScript. We prefer using Hono with a layered architecture: Handlers, Service Factories, and Services (as classes).
- To simplify DynamoDB integration, we will use the ElectroDB library.
- Example package.json snippet (some values are placeholders):

```JSON
{
  "name": "web-scanner",
  "version": "1.0.0",
  "description": "A daily resume for those website you want to be up to date.",
  "scripts": {
    "build": "esbuild src/index.ts --bundle --platform=node --target=node? --outfile=dist/index.js --external:?",
    "dev": "pnpm build && serverless offline",
    "deploy": "serverless deploy",
    "deploy:seed": "pnpm deploy && pnpm seed:configs",
    "seed:configs": "tsx scripts/seed-configs.ts",
    "remove": "serverless remove",
  },
  "devDependencies": {
    "@types/node": "^22.15.32",
    "@typescript-eslint/eslint-plugin": "^8.34.1",
    "@typescript-eslint/parser": "^8.34.1",
    "esbuild": "^0.25.5",
    "eslint": "^9.29.0",
    "serverless": "^4.17.1",
    "serverless-esbuild": "^1.55.1",
    "serverless-offline": "^14.4.0",
    "tsx": "^4.19.2",
    "typescript": "^5.0.0",
  },
  "engines": {
    "node": ">=18.x"
  },
  "license": "MIT"
}
```

- Use pnpm as the package manager.
- ALL CODE AND COMMENTS MUST BE WRITTEN IN ENGLISH.
