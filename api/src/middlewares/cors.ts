import { cors } from "hono/cors";

// ─────────────────────────────────────────────
// 横断的関心事（Middleware）
// 全ルートに共通でかける設定をここに集約する。
// 例：CORS、認証(JWT)、ロギング、エラーハンドリングなど。
// ─────────────────────────────────────────────
export const corsMiddleware = cors({
  origin: ["http://localhost:3000"],
  // Cookie(JWT) をクロスオリジンで送受信するために必須。
  // credentials を立てる時は origin に "*" を使えない（具体的なオリジンを列挙する）。
  credentials: true,
});
