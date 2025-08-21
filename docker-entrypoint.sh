#!/bin/sh

# Check if running locally with AWS Lambda Runtime Interface Emulator
if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
    # Running locally - use RIE
    exec /usr/bin/aws-lambda-rie /usr/bin/node dist/bootstrap.js
else
    # Running in AWS Lambda - use bootstrap
    exec /usr/bin/node dist/bootstrap.js
fi
