# Use the official Playwright image as base - contains Chromium and all dependencies
FROM mcr.microsoft.com/playwright:v1.54.0-noble

# Set the working directory
WORKDIR /var/task

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm@latest
# If a pnpm-lock.yaml is present use --frozen-lockfile, otherwise fall back to a normal install
RUN sh -c "if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi"

# Copy source code and build files
COPY . .

# Build the TypeScript code
RUN pnpm build

# Set environment variables for Lambda
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Lambda runtime interface emulator
ADD https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie /usr/bin/aws-lambda-rie
RUN chmod +x /usr/bin/aws-lambda-rie

# Entry point script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Set the entry point
ENTRYPOINT ["/docker-entrypoint.sh"]

# Command to run
CMD ["dist/index.handler"]
