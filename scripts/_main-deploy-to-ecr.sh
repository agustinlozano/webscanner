#!/bin/bash

# Usage: IMAGE_TAG=your-tag ./deploy-to-ecr.sh

set -e

# Configuration
AWS_REGION="us-east-2"  # Match your serverless.yml region
ECR_REPOSITORY_NAME="daily-scraper-web-scraper"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo "🚀 Starting ECR deployment process..."

# Step 1: Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "📋 AWS Account ID: $AWS_ACCOUNT_ID"

# Step 2: Create ECR repository if it doesn't exist
echo "📦 Creating ECR repository (if it doesn't exist)..."
aws ecr describe-repositories --repository-names $ECR_REPOSITORY_NAME --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository --repository-name $ECR_REPOSITORY_NAME --region $AWS_REGION

# Step 3: Get login token and authenticate Docker to ECR
echo "🔐 Authenticating Docker with ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 3.5: Clean up existing images with the same tag
echo "🧹 Cleaning up existing images with tag: $IMAGE_TAG"
aws ecr batch-delete-image \
    --repository-name $ECR_REPOSITORY_NAME \
    --region $AWS_REGION \
    --image-ids imageTag=$IMAGE_TAG 2>/dev/null || echo "No existing images to delete"

# Step 4: Setup buildx for cross-platform builds
echo "� Setting up Docker buildx..."
docker buildx ls | grep -q "lambda-builder" || docker buildx create --name lambda-builder --use

# Step 5: Build and push directly to ECR for x86_64 platform only
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME:$IMAGE_TAG"
echo "🔨 Building and pushing Docker image for x86_64 platform..."
echo "📍 Target URI: $ECR_URI"

# Use buildx to build and push directly, avoiding multi-arch manifest
# This building way fix "manifest not supported issue" (Service: Lambda, Status Code: 400, Request ID: 9f15d2c7-b0d1-49b1-b155-0a9ffb982672)
docker buildx build \
  --platform linux/amd64 \
  --push \
  --tag $ECR_URI \
  --provenance=false \
  --sbom=false \
  .

echo "✅ Successfully deployed to ECR!"
echo "📍 Image URI: $ECR_URI"
echo ""
echo "🔧 Next steps:"
echo "   - Update your serverless.yml if needed"
echo "   - Deploy Lambda function with: pnpm sls deploy"
echo ""
echo "ℹ️  Note: Image built for linux/amd64 platform (AWS Lambda compatible)"