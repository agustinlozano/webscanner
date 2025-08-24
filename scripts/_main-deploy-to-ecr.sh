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

# Step 4: Build the Docker image
echo "🔨 Building Docker image..."
docker build -t $ECR_REPOSITORY_NAME:$IMAGE_TAG .

# Step 5: Tag the image for ECR
ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME:$IMAGE_TAG"
echo "🏷️  Tagging image: $ECR_URI"
docker tag $ECR_REPOSITORY_NAME:$IMAGE_TAG $ECR_URI

# Step 6: Push the image to ECR
echo "📤 Pushing image to ECR..."
docker push $ECR_URI

echo "✅ Successfully deployed to ECR!"
echo "📍 Image URI: $ECR_URI"
echo ""
echo "🔧 Next steps:"
echo "   - Update your serverless.yml if needed"
echo "   - Deploy Lambda function with: pnpm sls deploy"
