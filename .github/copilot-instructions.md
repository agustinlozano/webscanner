## Project context

This project is a serverless web scraper that runs daily. It uses **AWS Lambda with a Docker image** containing **Playwright** and Chromium to scrape content from websites and match it against certain keywords or topics. The image is built locally and pushed to **Amazon ECR**. The Lambda function fetches that container image and executes the scraping logic.

The app is written in **Node.js**, and the Docker image is based on `https://github.com/microsoft/playwright/blob/main/utils/docker/Dockerfile.noble`. The Lambda function is likely triggered by an EventBridge cron rule and may send results via Telegram bot.

## Coding style

- Use modern TypeScript.
- Keep AWS-related code simple: use environment variables for config, and avoid complex VPC networking unless absolutely necessary.
- Use `async/await` over `.then()`/`.catch()`.
- Prefer clear, readable function names and concise logic.
- Always kebab-case for filenames and directories.
- The project assumes Playwright will be run in **headless** mode inside AWS Lambda.

## Libraries and Frameworks

- Scraping: Playwright
- Scheduling: EventBridge
- Serverless framework for deployment (v4)
- Pnpm for package management
- Use of `esbuild` for bundling TypeScript code
  <!-- - Content Summarization: OpenAI model -->
  <!-- - Storage: DynamoDB using ElectroDB -->
  <!-- - Hono for API handling (if needed) -->

## What Copilot Chat should avoid

- Avoid Spanish code and comments. Always use English.
- Don’t suggest frontend/UI code – this is a backend project only.
