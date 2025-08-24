#!/bin/zsh
set -euo pipefail

# Restart workflow: clean, build, run
./docker-clean.sh
./docker-build.sh
docker run -d -p 9000:8080 --name web-scanner web-scanner
