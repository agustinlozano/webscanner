#!/bin/zsh
set -euo pipefail

# Tag and push image to ECR. Adjust ACCOUNT/REGION/REPO as needed.
ACCOUNT=849681699653
REGION=us-east-2
REPO=web-scanner

# Allow overriding the tag via environment variable `tag`; default to 'latest'
tag=${tag:-latest}

IMAGE_NAME=${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com/${REPO}:${tag}

# Tag local image (uses the same tag name) and push
docker tag web-scanner:${tag} "${IMAGE_NAME}"
aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${ACCOUNT}.dkr.ecr.${REGION}.amazonaws.com"
docker push "${IMAGE_NAME}"
