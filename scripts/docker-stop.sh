#!/bin/zsh
set -euo pipefail

docker stop web-scanner || echo "Container not running"
