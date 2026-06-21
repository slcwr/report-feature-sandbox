# Hono + DuckDB レポートAPI（Lambda想定のローカル開発）
# 機能用 RDB として MySQL(db サービス) に繋ぐため、mysql クライアントも入れる。
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends git curl ca-certificates sudo \
  default-mysql-client \
  && rm -rf /var/lib/apt/lists/* \
  && echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node

# マウントポイントを node 所有で先に作る（EACCES対策）
RUN mkdir -p /workspace/api /workspace/data \
  && chown -R node:node /workspace

WORKDIR /workspace/api
USER node
EXPOSE 8787
