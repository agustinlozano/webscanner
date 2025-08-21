# Web Scraper Service

A serverless web scraper that extracts content from specified websites and returns structured data for downstream processing. This service focuses solely on scraping and organizing responses - other services handle summarization, keyword matching, and storage.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Docker
- AWS CLI configured

### Installation

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Test locally (requires serverless-offline)
pnpm dev
```

### Docker Setup

```bash
# Build the Docker image
docker build -t web-scanner .

# Test locally with Docker
docker run -p 9000:8080 web-scanner

# Test the function
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
```

### AWS Deployment

1. Create an ECR repository:

```bash
aws ecr create-repository --repository-name web-scanner
```

2. Build and push the Docker image:

```bash
# Get login token
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-2.amazonaws.com

# Tag and push
docker tag web-scanner:latest <account-id>.dkr.ecr.us-east-2.amazonaws.com/web-scanner:latest
docker push <account-id>.dkr.ecr.us-east-2.amazonaws.com/web-scanner:latest
```

3. Update `serverless.yml` with your ECR image URI and deploy:

```bash
pnpm deploy
```

## 📁 Project Structure

```
src/
├── index.ts                 # Main Lambda handler
├── scraper/                 # Web scraping logic
│   ├── scraper-service.ts   # Playwright-based scraper
│   └── mock-scraper-service.ts # Mock scraper for local development
└── utils/                   # Utilities and configurations
    └── website-configs.ts   # Website scraping configurations
```

## 🔧 Configuration

Current websites being monitored:

- Australian Embassy in Argentina (Twitter)
- Australian Immigration News Archive

## 📊 Response Format

The service returns a structured JSON response with scraped content:

```json
{
  "success": true,
  "timestamp": "2025-08-21T10:30:00.000Z",
  "sitesProcessed": 2,
  "totalSitesConfigured": 2,
  "results": [
    {
      "name": "Australian Embassy in Argentina - Twitter",
      "url": "https://x.com/EmbAustraliaBA",
      "title": "Page Title",
      "content": "Scraped content...",
      "keywords": ["keyword1", "keyword2"],
      "contentLength": 1250,
      "scrapedAt": "2025-08-21T10:30:00.000Z",
      "status": "success"
    }
  ],
  "executionTime": 5432
}
```

## 📋 Development Status

### ✅ Completed

- [x] Basic project structure with TypeScript, pnpm, serverless
- [x] Docker setup with Playwright base image
- [x] AWS Lambda handler with proper typing
- [x] Scraper service with Playwright
- [x] Website configuration system
- [x] Mock scraper for local development
- [x] Structured response format
- [x] Error handling and resilience
- [x] ESLint configuration
- [x] Build and deployment scripts

### 🎯 Service Boundaries

This service is **responsible for**:

- Web scraping using Playwright
- Content extraction and cleaning
- Structured response formatting
- Error handling and resilience

This service is **NOT responsible for**:

- Content summarization (handled by downstream services)
- Keyword matching (handled by downstream services)
- Data storage (handled by downstream services)
- File system operations

## 🛠️ Scripts

- `pnpm build` - Build TypeScript code
- `pnpm dev` - Build and run with serverless offline
- `pnpm deploy` - Deploy to AWS
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm type-check` - Run TypeScript type checking
