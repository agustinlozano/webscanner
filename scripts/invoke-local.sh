#!/bin/zsh
set -euo pipefail

# Invoke the local lambda-style endpoint used by serverless-offline
curl -sS -XPOST 'http://localhost:9000/2015-03-31/functions/function/invocations' -d '{}' -H 'Content-Type: application/json'
