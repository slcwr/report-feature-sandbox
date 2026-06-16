#!/usr/bin/env bash
# web（React Router v7）を公式テンプレートで生成するスクリプト
# devcontainer内で一度だけ実行する
set -e

if [ -f /workspace/web/package.json ]; then
  echo "⚠ web/package.json が既に存在します。スキップします。"
  exit 0
fi

echo "▶ React Router v7 を web/ に生成します..."
cd /workspace
# 一時ディレクトリに生成してから中身を web/ に移す
# （web/ には Dockerfile が既にあるため、上書きせず中身だけ展開）
npx create-react-router@latest web-tmp --no-git-init --yes
cp -r web-tmp/. web/
rm -rf web-tmp

cd /workspace/web
npm install

echo "✓ web の生成完了"
echo ""
echo "起動方法："
echo "  ターミナルA: cd /workspace/api && npm install && npm run dev"
echo "  ターミナルB: cd /workspace/web && npm run dev"
echo "  ブラウザ:    http://localhost:3000"
