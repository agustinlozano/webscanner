#!/bin/zsh
set -euo pipefail

if docker ps | grep -q "web-scanner"; then
  docker ps | grep web-scanner
else
  echo "No web-scanner containers running"
fi
