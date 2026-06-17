import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { reports } from "./routes/reports";

// ─────────────────────────────────────────────
// レポートAPI（Hono + DuckDB）
// ここは「app の組み立て」と「起動」だけを担当する。
//   - DB（DuckDB）まわり … db.ts
//   - レポートのルート     … routes/reports.ts
// ─────────────────────────────────────────────

// RPC を効かせるため、ここもメソッドチェーンで組み立てる。
const app = new Hono()
  .use("/*", cors({ origin: ["http://localhost:3000"] }))
  // 動作確認
  .get("/health", (c) => c.json({ ok: true }))
  // レポート系をまとめてマウント（パスの接頭辞はここで一括指定）
  .route("/api/reports", reports);

// RPC クライアント（hc<AppType>）が参照する型。
// web 側はこの型だけを import すれば、型安全に api を呼べる。
export type AppType = typeof app;

serve({ fetch: app.fetch, port: 8787, hostname: "0.0.0.0" }, (info) => {
  console.log(`Report API listening on http://localhost:${info.port}`);
});
