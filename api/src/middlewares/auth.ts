import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { config } from "../config";

// ─────────────────────────────────────────────
// 横断的関心事（Middleware / 認証）
// Authorization: Bearer <JWT> を検証し、通れば c.set("userId", ...) で後段に渡す。
// 保護したいルートにだけ差し込んで使う（例：.get("/me", authMiddleware, ...)）。
// ─────────────────────────────────────────────

export const authMiddleware = createMiddleware<{
  Variables: { userId: number };
}>(async (c, next) => {
  // Authorization ヘッダーから "Bearer xxx" の xxx を取り出す。
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    return c.json({ error: "ログインが必要です" }, 401);
  }

  try {
    const payload = await verify(token, config.jwtSecret, "HS256");
    // sub に入れたユーザーIDを取り出して後段へ。
    c.set("userId", Number(payload.sub));
  } catch {
    // 署名不正・期限切れなど。
    return c.json({ error: "セッションが無効です。再ログインしてください" }, 401);
  }

  await next();
});
