# report-feature-sandbox

教育動画サービスのレポート機能の練習用。フロント(Remix/React Router v7)と
バックエンド(Hono + DuckDB)を1リポジトリに「ただ同居」させた構成です。

データの流れ：
```
ブラウザ → web(Remixのloader) → api(Hono) → DuckDB → data/watch_logs.csv
```
本番では DuckDB の代わりに Athena を叩く想定ですが、「集計してJSONを返す」形は同じ。

## 構成

```
report-feature-sandbox/
├── .devcontainer/devcontainer.json
├── docker-compose.yml        web + api の2コンテナ
├── biome.json
├── setup-web.sh              web を生成するスクリプト
├── data/
│   └── watch_logs.csv        レポート元データ
├── api/                      Hono + DuckDB（レポートAPI・動作確認済み）
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── sql/                  集計SQL置き場（任意）
│   └── src/index.ts          レポートAPI本体
├── web/                      React Router v7（setup-web.sh で生成）
│   └── Dockerfile
└── web-samples/
    └── reports.tsx           ★ web生成後に web/app/routes/ へ置くサンプル
```

## セットアップ手順

1. Docker Desktop を起動
2. このフォルダを VS Code で開き「Reopen in Container」
3. web を生成：
   ```bash
   bash /workspace/setup-web.sh
   ```
4. レポート表示サンプルを配置：
   ```bash
   cp /workspace/web-samples/reports.tsx /workspace/web/app/routes/reports.tsx
   ```
   さらに web/app/routes.ts に以下を追記：
   ```ts
   route("reports", "routes/reports.tsx"),
   ```
5. 2つのターミナルで起動：
   ```bash
   # ターミナルA（API）
   cd /workspace/api && npm install && npm run dev
   # ターミナルB（フロント）
   cd /workspace/web && npm run dev
   ```
6. ブラウザで確認：
   - レポート画面: http://localhost:3000/reports
   - API直接:     http://localhost:8787/api/reports/completion-by-school

## api のレポートエンドポイント（動作確認済み）

- `GET /health` … 動作確認
- `GET /api/reports/completion-by-school` … 学校別の完了率
- `GET /api/reports/video-ranking` … 動画別ランキング
- `GET /api/reports/at-risk-students` … 要注意の生徒（平均進捗が低い順）

## 「ただ同居」について

web と api を1リポジトリに置いているが、workspaces 等は使わず、
それぞれ個別に `npm install` して個別に動かすシンプルな構成。
将来フロントとAPIで型を共有したくなったら、shared/ フォルダを足して
monorepo らしく育てられる（今は不要）。

## レポートを増やすには

1. api/src/index.ts に新しいエンドポイントを足す（集計SQLを書く）
2. web 側に表示するルートを足す（reports.tsx を参考に）

集計ロジックは「軸(GROUP BY) × 指標(集計関数)」で組み立てる。
