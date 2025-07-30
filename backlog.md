# 📋 Web Scanner – Project Backlog

## 🔍 Epic 1: Initial Setup & Infrastructure

### ✅ Task 1.1: Create base project repository

- Initialize with pnpm, serverless, and TypeScript
- Add ESLint + basic project structure

### ✅ Task 1.2: Set up Docker environment

- Create Dockerfile using Playwright base image (v1.54.0-noble)
- Build image locally and push to Amazon ECR
- Document the process

### ✅ Task 1.3: Deploy first AWS Lambda using Docker image

- Configure serverless.yml to use ECR image
- Deploy Lambda function
- Test that Lambda executes Playwright inside container

### 🔜 Task 1.4: Configure EventBridge for daily scheduling

- Create EventBridge rule to trigger Lambda daily
- Confirm time zone and frequency match expected behavior

## 🌐 Epic 2: Scraping Configuration

### 🔜 Task 2.1: Define page scanning config schema

Each page must support:

- url
- name
- customDelay or loader behavior
- keywords/topics
- customSelectors (if needed)

### 🔜 Task 2.2: Seed initial configs into DynamoDB

- Use ElectroDB to define WebsiteConfig model
- Create scripts/seed-configs.ts to store:
  - https://x.com/EmbAustraliaBA
  - https://immi.homeaffairs.gov.au/news-media/archive

## 🧠 Epic 3: AI Content Summarization

### 🔜 Task 3.1: Integrate OpenAI summarization

- Use a GPT model to summarize scraped content
- Wrap the summarization logic in a service class
- Add retries and token handling

### 🔜 Task 3.2: Define format for summarized results

Include:

- title
- summary
- detected_keywords
- url
- scraped_at

### 🧪 Task 3.3: Test model accuracy on visa-related content

- Ensure Subclass 462 and Argentina-specific info are detected correctly

## 🏷️ Epic 4: Keyword/Topic Matching

### 🔜 Task 4.1: Implement keyword matching logic

Match keywords against:

- full page text
- summarized content

Score and rank keyword matches

### 🔜 Task 4.2: Store matches in DynamoDB

Store relevant DetectedMatch entity with summary and match score

## 🧱 Epic 5: Project Scalability & Clean Architecture

### 🔜 Task 5.1: Define project folder structure

Suggested layers:

- scraper/
- summarizer/
- matcher/
- database/
- utils/

🔜 Task 5.2: Add ability to configure new pages easily
New page config should be detected and scheduled without code changes

## 🛠️ Epic 6: CLI and Dev Utilities

### 🔜 Task 6.1: Create scripts/seed-configs.ts

Seed initial configs for Embassy and Immigration pages

### 🔜 Task 6.2: Add scripts to package.json

```json
{
  "scripts": {
    "build": "...",
    "dev": "pnpm build && serverless offline",
    "deploy": "serverless deploy",
    "deploy:seed": "pnpm deploy && pnpm seed:configs",
    "seed:configs": "tsx scripts/seed-configs.ts",
    "remove": "serverless remove"
  }
}
```
