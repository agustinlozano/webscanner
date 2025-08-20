#!/bin/sh

# Check if AWS Lambda Runtime Interface Emulator should be used
if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
    # Running locally with RIE - create a simple bootstrap
    cat > bootstrap.js << 'EOF'
const { handler } = require('./dist/index.js');

// Simple Lambda runtime emulation
const http = require('http');

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                console.log('Received request, invoking handler...');
                const event = JSON.parse(body || '{}');
                const context = {
                    awsRequestId: 'local-' + Date.now(),
                    getRemainingTimeInMillis: () => 300000
                };
                
                const result = await handler(event, context);
                console.log('Handler completed successfully');
                
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(result));
            } catch (error) {
                console.error('Handler error:', error);
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({
                    errorMessage: error.message,
                    errorType: error.constructor.name
                }));
            }
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Lambda function is running');
    }
});

server.listen(8080, () => {
    console.log('Lambda function listening on port 8080');
});
EOF
    exec /usr/bin/node bootstrap.js
else
    # Running in actual Lambda environment  
    exec /usr/bin/node dist/index.js
fi
