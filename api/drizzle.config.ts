import { defineConfig } from "drizzle-kit";

// ─────────────────────────────────────────────
// drizzle-kit の設定（マイグレーション生成・適用）
//   - schema   … テーブル定義の場所
//   - out      … 生成された SQL マイグレーションの置き場
//   - dialect  … mysql（本番 TiDB も MySQL 互換なので共通）
//
// 使い方：
//   npm run db:generate  … schema から SQL を生成（DB接続不要）
//   npm run db:migrate   … 生成した SQL を DB に適用（DB接続必要）
//   npm run db:studio    … ブラウザでテーブルを覗く
// ─────────────────────────────────────────────
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "mysql://app:app@localhost:3306/app",
  },
});
