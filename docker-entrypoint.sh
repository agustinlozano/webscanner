#!/bin/sh

# Check if AWS Lambda Runtime Interface Emulator should be used
if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
    # Running locally with RIE
    exec /usr/bin/aws-lambda-rie /usr/local/bin/node dist/index.js
else
    # Running in actual Lambda environment
    exec /usr/local/bin/node dist/index.js
fi
