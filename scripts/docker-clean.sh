#!/bin/zsh
set -euo pipefail

# Stop and remove container if exists; print friendly messages
docker stop web-scanner || echo "Container not running"
docker rm web-scanner || echo "Container not found"
