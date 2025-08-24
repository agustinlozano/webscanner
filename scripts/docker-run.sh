#!/bin/zsh
set -euo pipefail

docker run -d -p 9000:8080 --name web-scanner web-scanner
