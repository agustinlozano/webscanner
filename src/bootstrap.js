// AWS Lambda Runtime API bootstrap for container images
const { handler } = require("./index.js");
const http = require("http");

// For Lambda Runtime API (container images)
if (process.env.AWS_LAMBDA_RUNTIME_API) {
  const runtimeApi = process.env.AWS_LAMBDA_RUNTIME_API;

  function httpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const req = http.request(
        {
          hostname: urlObj.hostname,
          port: urlObj.port || 80,
          path: urlObj.pathname + urlObj.search,
          method: options.method || "GET",
          headers: options.headers || {},
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const response = {
                ok: res.statusCode >= 200 && res.statusCode < 300,
                status: res.statusCode,
                statusText: res.statusMessage,
                headers: {
                  get: (name) => res.headers[name.toLowerCase()],
                },
                json: () => Promise.resolve(JSON.parse(data)),
                text: () => Promise.resolve(data),
              };
              resolve(response);
            } catch (error) {
              reject(error);
            }
          });
        }
      );

      req.on("error", reject);

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  async function processEvents() {
    while (true) {
      try {
        console.log("Waiting for next event...");

        // Get next event from Lambda Runtime API
        const nextEventUrl = `http://${runtimeApi}/2018-06-01/runtime/invocation/next`;
        const response = await httpRequest(nextEventUrl);

        if (!response.ok) {
          console.error(
            "Failed to get next event:",
            response.status,
            response.statusText
          );
          continue;
        }

        const event = await response.json();
        const requestId = response.headers.get("lambda-runtime-aws-request-id");
        const deadlineMs = response.headers.get("lambda-runtime-deadline-ms");

        console.log(`Processing request ${requestId}`);

        const context = {
          awsRequestId: requestId,
          getRemainingTimeInMillis: () => parseInt(deadlineMs) - Date.now(),
          functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
          functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
          memoryLimitInMB: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
          logGroupName: process.env.AWS_LAMBDA_LOG_GROUP_NAME,
          logStreamName: process.env.AWS_LAMBDA_LOG_STREAM_NAME,
        };

        try {
          const result = await handler(event, context);

          // Send response
          const responseUrl = `http://${runtimeApi}/2018-06-01/runtime/invocation/${requestId}/response`;
          await httpRequest(responseUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(result || {}),
          });

          console.log(`Request ${requestId} completed successfully`);
        } catch (error) {
          console.error(`Error processing request ${requestId}:`, error);

          // Send error response
          const errorUrl = `http://${runtimeApi}/2018-06-01/runtime/invocation/${requestId}/error`;
          await httpRequest(errorUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              errorMessage: error.message,
              errorType: error.constructor.name,
              stackTrace: error.stack ? error.stack.split("\n") : [],
            }),
          });
        }
      } catch (error) {
        console.error("Runtime error:", error);
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  console.log("Starting Lambda runtime...");
  processEvents().catch((error) => {
    console.error("Failed to start event processing:", error);
    process.exit(1);
  });
} else {
  // For standard Lambda execution (non-container)
  exports.handler = handler;
}
