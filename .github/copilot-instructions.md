## Project context

This project is a serverless web scraper that runs daily. It uses **AWS Lambda with a Docker image** containing **Playwright** and Chromium to scrape content from websites and match it against certain keywords or topics. The image is built locally and pushed to **Amazon ECR**. The Lambda function fetches that container image and executes the scraping logic. The user is not interested in optimizing the image size at this stage.

The app is written in **Node.js**, and the Docker image is based on `mcr.microsoft.com/playwright:v1.44.0-jammy` or similar. The Lambda function is likely triggered by an EventBridge cron rule and may send results via email, store them in a database, or log them to S3.

## Coding style

- Use modern TypeScript.
- Keep AWS-related code simple: use environment variables for config, and avoid complex VPC networking unless absolutely necessary.
- Use `async/await` over `.then()`/`.catch()`.
- Prefer clear, readable function names and concise logic.
- Always kebab-case for filenames and directories.
- Dockerfiles should be clean and minimal, but not overly optimized.
- The project assumes Playwright will be run in **headless** mode inside AWS Lambda.

## Libraries and Frameworks

- Scraping: Playwright
- Scheduling: EventBridge
- Content Summarization: OpenAI model
- Storage: DynamoDB using ElectroDB
- Serverless framework for deployment
- Pnpm for package management
- Hono for API handling (if needed)
- Use of `esbuild` for bundling TypeScript code

## What Copilot Chat should focus on

- Help write or improve the **scraping logic using Playwright**.
- Suggest improvements to the **Dockerfile for AWS Lambda** compatibility.
- Assist with **Amazon ECR push/pull flows** via CLI.
- Help troubleshoot **AWS Lambda + Docker** deployments.
- Generate minimal IAM permissions for Lambda to use ECR.
- Assist with writing scripts for deployment (e.g., using AWS CLI).
- Help analyze or filter scraped content based on keywords.

## What Copilot Chat should avoid

- Avoid Spanish code and comments. Always use English.
- Don’t suggest frontend/UI code – this is a backend project only.
