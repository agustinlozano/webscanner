#!/bin/zsh
set -euo pipefail

if docker images | grep -q "web-scanner"; then
  docker images | grep "web-scanner"
else
  echo "No web-scanner images found"
fi
