# Web Scanner

A daily scanner for specific web pages to generate summaries and analyze/categorize their content.

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
│   └── scraper-service.ts   # Playwright-based scraper
├── summarizer/              # AI summarization (TODO)
├── matcher/                 # Keyword matching (TODO)
├── database/                # DynamoDB models (TODO)
└── utils/                   # Utilities and configurations
    └── website-configs.ts   # Website scraping configurations

scripts/                     # Utility scripts
└── seed-configs.ts          # Database seeding (TODO)
```

## 🔧 Configuration

Current websites being monitored:

- Australian Embassy in Argentina (Twitter)
- Australian Immigration News Archive

Keywords being tracked:

- Subclass 462 visa
- Work and Holiday visa
- Argentina-specific visa information

## 📋 Development Status

### ✅ Completed (Epic 1 - Task 1)

- [x] Basic project structure with TypeScript, pnpm, serverless
- [x] Docker setup with Playwright base image
- [x] AWS Lambda handler with proper typing
- [x] Basic scraper service with Playwright
- [x] Website configuration system
- [x] ESLint configuration
- [x] Build and deployment scripts

### 🔜 Next Steps

- [ ] Deploy first AWS Lambda using Docker image (Epic 1 - Task 1.3)
- [ ] Configure EventBridge for daily scheduling (Epic 1 - Task 1.4)
- [ ] Implement DynamoDB models (Epic 2)
- [ ] Add OpenAI summarization (Epic 3)
- [ ] Implement keyword matching (Epic 4)

## 🛠️ Scripts

- `pnpm build` - Build TypeScript code
- `pnpm dev` - Build and run with serverless offline
- `pnpm deploy` - Deploy to AWS
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm type-check` - Run TypeScript type checking
