import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { corsMiddleware } from "./middlewares/cors";
import { reports } from "./routes/reports";
import { auth } from "./routes/auth";
import { AuthError } from "./services/auth";

// ─────────────────────────────────────────────
// レポートAPI（Hono + DuckDB）
// ここは「app の組み立て」と「起動」だけを担当する（合成ルート / Composition Root）。
// 各層の責務：
//   - routes/        … HTTP（プレゼンテーション層）
//   - services/      … 業務ロジック
//   - repositories/  … データアクセス（SQL）
//   - db/            … DB 接続（インフラ層）
//   - middlewares/   … CORS など横断的関心事
// ─────────────────────────────────────────────

// RPC を効かせるため、ここもメソッドチェーンで組み立てる。
const app = new Hono()
  .use("/*", corsMiddleware)
  // 動作確認
  .get("/health", (c) => c.json({ ok: true }))
  // レポート系をまとめてマウント（パスの接頭辞はここで一括指定）
  .route("/api/reports", reports)
  // 認証系（登録・ログイン・ログアウト・自分の情報）
  .route("/api/auth", auth)
  // 業務エラー(AuthError)を HTTP ステータスに変換する。
  // service 層は Hono を知らずに throw でき、ここで一括変換する。
  .onError((err, c) => {
    if (err instanceof AuthError) {
      return c.json({ error: err.message }, err.status);
    }
    console.error(err);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  });

// RPC クライアント（hc<AppType>）が参照する型。
// web 側はこの型だけを import すれば、型安全に api を呼べる。
export type AppType = typeof app;

serve({ fetch: app.fetch, port: 8787, hostname: "0.0.0.0" }, (info) => {
  console.log(`Report API listening on http://127.0.0.1:${info.port}`);
});
