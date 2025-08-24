#!/bin/zsh
set -euo pipefail

docker rm web-scanner || echo "Container not found"
