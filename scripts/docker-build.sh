#!/bin/zsh
#!/bin/zsh
set -euo pipefail

# dev: build, ensure old container removed, build image, run container and invoke local lambda
pnpm build
if [ -n "$(docker ps -a -q -f name=web-scanner)" ]; then
  docker rm -f web-scanner
fi
docker build --platform linux/amd64 -t web-scanner .
