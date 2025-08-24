#!/bin/zsh
set -euo pipefail

# Simple HTTP POST to local lambda endpoint
curl -sS -X POST 'http://localhost:9000' -d '{}' -H 'Content-Type: application/json'
