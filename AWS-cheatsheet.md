# AWS Deployment Guide

This document contains all the AWS CLI commands used to deploy the Web Scanner Lambda function with Docker image to AWS.

## Prerequisites

- AWS CLI configured with appropriate permissions
- Docker installed and running
- ECR repository created
- Valid AWS account with Lambda and ECR access

## Environment Variables

Replace these values with your actual AWS account details:

```bash
# Your AWS Account ID
AWS_ACCOUNT_ID="849681699653"

# AWS Region
AWS_REGION="us-east-2"

# ECR Repository Name
REPO_NAME="web-scanner"

# Lambda Function Name
FUNCTION_NAME="daily-scraper-dev-runScraper"
```

## Step 1: Verify AWS Configuration

Check if AWS CLI is configured and get account information:

```bash
aws sts get-caller-identity
```

Expected output:

```json
{
  "UserId": "AIDA...",
  "Account": "849681699653",
  "Arn": "arn:aws:iam::849681699653:user/your-user"
}
```

## Step 2: Create ECR Repository

Create a new ECR repository for your Docker images:

```bash
aws ecr create-repository --repository-name web-scanner --region us-east-2
```

Expected output:

```json
{
  "repository": {
    "repositoryArn": "arn:aws:ecr:us-east-2:849681699653:repository/web-scanner",
    "registryId": "849681699653",
    "repositoryName": "web-scanner",
    "repositoryUri": "849681699653.dkr.ecr.us-east-2.amazonaws.com/web-scanner"
  }
}
```

## Step 3: Login to ECR

Authenticate Docker with your ECR registry:

```bash
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 849681699653.dkr.ecr.us-east-2.amazonaws.com
```

Expected output:

```
Login Succeeded
```

## Step 4: Build and Push Docker Image

### Build the Docker image locally:

```bash
# Build the project first
pnpm build

# Build Docker image
docker build -t web-scanner .
```

### Tag the image for ECR:

```bash
docker tag web-scanner:latest 849681699653.dkr.ecr.us-east-2.amazonaws.com/web-scanner:latest
```

### Push the image to ECR:

```bash
docker push 849681699653.dkr.ecr.us-east-2.amazonaws.com/web-scanner:latest
```

Expected output:

```
The push refers to repository [849681699653.dkr.ecr.us-east-2.amazonaws.com/web-scanner]
...
latest: digest: sha256:... size: 3257
```

## Step 5: Deploy Lambda Function

Deploy the Lambda function using Serverless Framework:

```bash
# Deploy to production using ECR image
pnpm deploy:prod
```

This uses the `serverless.prod.yml` configuration file.

## Step 6: Test the Lambda Function

### Manual Invocation

Invoke the Lambda function manually to test:

```bash
aws lambda invoke --function-name daily-scraper-dev-runScraper --region us-east-2 response.json
```

### Check the response:

```bash
# PowerShell
Get-Content response.json

# Bash/Linux
cat response.json
```

Expected successful response:

```json
{
  "StatusCode": 200,
  "ExecutedVersion": "$LATEST"
}
```

## Step 7: Monitor Logs

### List log streams:

```bash
aws logs describe-log-streams --log-group-name "/aws/lambda/daily-scraper-dev-runScraper" --region us-east-2 --order-by LastEventTime --descending --max-items 1
```

### Get log events (replace LOG_STREAM_NAME with actual value):

```bash
aws logs get-log-events --log-group-name "/aws/lambda/daily-scraper-dev-runScraper" --log-stream-name "LOG_STREAM_NAME" --region us-east-2
```

Example with actual log stream name:

```bash
aws logs get-log-events --log-group-name "/aws/lambda/daily-scraper-dev-runScraper" --log-stream-name "2025/08/21/[\$LATEST]a90a08bc5bc94bdd8cb2fd382bffcc97" --region us-east-2
```

## Useful Management Commands

### List ECR repositories:

```bash
aws ecr describe-repositories --region us-east-2
```

### List images in repository:

```bash
aws ecr list-images --repository-name web-scanner --region us-east-2
```

### Get Lambda function information:

```bash
aws lambda get-function --function-name daily-scraper-dev-runScraper --region us-east-2
```

### Update Lambda function with new image:

```bash
aws lambda update-function-code --function-name daily-scraper-dev-runScraper --image-uri 849681699653.dkr.ecr.us-east-2.amazonaws.com/web-scanner:latest --region us-east-2
```

## Cleanup Commands

### Delete Lambda function:

```bash
# Using Serverless Framework
pnpm remove:prod

# Or using AWS CLI
aws lambda delete-function --function-name daily-scraper-dev-runScraper --region us-east-2
```

### Delete ECR repository:

```bash
aws ecr delete-repository --repository-name web-scanner --region us-east-2 --force
```

### Delete log group:

```bash
aws logs delete-log-group --log-group-name "/aws/lambda/daily-scraper-dev-runScraper" --region us-east-2
```

## Automation Scripts

### Complete Deployment Script

Create a script to automate the entire deployment process:

```bash
#!/bin/bash
# deploy.sh

set -e

# Configuration
AWS_ACCOUNT_ID="849681699653"
AWS_REGION="us-east-2"
REPO_NAME="web-scanner"
IMAGE_TAG="latest"

echo "Building project..."
pnpm build

echo "Building Docker image..."
docker build -t $REPO_NAME .

echo "Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "Tagging image..."
docker tag $REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME:$IMAGE_TAG

echo "Pushing image to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME:$IMAGE_TAG

echo "Deploying Lambda function..."
pnpm deploy:prod

echo "Testing function..."
aws lambda invoke --function-name daily-scraper-dev-runScraper --region $AWS_REGION response.json

echo "Deployment completed successfully!"
```

### PowerShell Version

```powershell
# deploy.ps1

$AWS_ACCOUNT_ID = "849681699653"
$AWS_REGION = "us-east-2"
$REPO_NAME = "web-scanner"
$IMAGE_TAG = "latest"

Write-Host "Building project..." -ForegroundColor Green
pnpm build

Write-Host "Building Docker image..." -ForegroundColor Green
docker build -t $REPO_NAME .

Write-Host "Logging into ECR..." -ForegroundColor Green
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

Write-Host "Tagging image..." -ForegroundColor Green
docker tag "$REPO_NAME:$IMAGE_TAG" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME:$IMAGE_TAG"

Write-Host "Pushing image to ECR..." -ForegroundColor Green
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME:$IMAGE_TAG"

Write-Host "Deploying Lambda function..." -ForegroundColor Green
pnpm deploy:prod

Write-Host "Testing function..." -ForegroundColor Green
aws lambda invoke --function-name daily-scraper-dev-runScraper --region $AWS_REGION response.json

Write-Host "Deployment completed successfully!" -ForegroundColor Green
```

## Troubleshooting

### Common Issues and Solutions

1. **ECR Login Issues**

   ```bash
   # Re-authenticate
   aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 849681699653.dkr.ecr.us-east-2.amazonaws.com
   ```

2. **Docker Build Issues**

   ```bash
   # Clean Docker cache
   docker system prune -f
   docker image prune -f
   ```

3. **Lambda Function Errors**

   ```bash
   # Check latest logs
   aws logs describe-log-streams --log-group-name "/aws/lambda/daily-scraper-dev-runScraper" --region us-east-2 --order-by LastEventTime --descending --max-items 1
   ```

4. **Permission Issues**
   ```bash
   # Verify AWS credentials
   aws sts get-caller-identity
   ```

## Configuration Files Reference

### serverless.prod.yml

```yaml
service: daily-scraper
frameworkVersion: "4"

provider:
  name: aws
  region: us-east-2
  ecr:
    images:
      scraper-image:
        uri: 849681699653.dkr.ecr.us-east-2.amazonaws.com/web-scanner:latest

functions:
  runScraper:
    image: scraper-image
    timeout: 300 # 5 minutes
    memorySize: 1024 # Recommended for Playwright
    events:
      - schedule: rate(1 day) # Execute daily
```

### package.json scripts

```json
{
  "scripts": {
    "deploy:prod": "serverless deploy --config serverless.prod.yml",
    "remove:prod": "serverless remove --config serverless.prod.yml"
  }
}
```

---

_Last updated: August 21, 2025_
