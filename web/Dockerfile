# React Router v7（Remix）フロント / 開発拠点
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends git curl ca-certificates sudo \
  && rm -rf /var/lib/apt/lists/* \
  && echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node

RUN mkdir -p /workspace/web \
  && chown -R node:node /workspace

WORKDIR /workspace/web
USER node
EXPOSE 3000
