#!/bin/zsh
set -euo pipefail

# Build then push to ECR
./docker-build.sh
./docker-push.sh
