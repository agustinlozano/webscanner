#!/bin/zsh
set -euo pipefail

# Build, push image to ECR, then run serverless deploy
./docker-build-push.sh
serverless deploy
