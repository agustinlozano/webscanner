# Based on this Dockerfile.noble
# https://github.com/microsoft/playwright/blob/main/utils/docker/Dockerfile.noble

# Use Ubuntu Noble as base (more compatible with AWS Lambda)
FROM ubuntu:noble

ARG DEBIAN_FRONTEND=noninteractive
ARG TZ=America/Los_Angeles

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# === INSTALL Node.js ===
RUN apt-get update && \
    # Install Node.js
    apt-get install -y curl wget gpg ca-certificates && \
    mkdir -p /etc/apt/keyrings && \
    curl -sL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" >> /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs && \
    # Feature-parity with node.js base images
    apt-get install -y --no-install-recommends git openssh-client && \
    # clean apt cache
    rm -rf /var/lib/apt/lists/*

# === INSTALL Playwright and browsers ===
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Set working directory
WORKDIR /var/task

# Install pnpm globally
RUN npm install -g pnpm@latest

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies and Playwright
RUN pnpm install --frozen-lockfile || pnpm install

# Install Playwright browsers with dependencies
RUN npx playwright install --with-deps chromium && \
    # Set proper permissions for Lambda
    chmod -R 755 /ms-playwright && \
    # Clean up
    rm -rf /var/lib/apt/lists/* && \
    rm -rf ~/.npm/

# Copy application code
COPY . .

# Build the application
RUN pnpm build

# Lambda runtime interface emulator
ADD https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie /usr/bin/aws-lambda-rie
RUN chmod +x /usr/bin/aws-lambda-rie

# Entry point script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Set environment variables for production
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Set the entry point
ENTRYPOINT ["/docker-entrypoint.sh"]

# Command to run
CMD ["dist/bootstrap.js"]
