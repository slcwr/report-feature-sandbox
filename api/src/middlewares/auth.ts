import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";

// ─────────────────────────────────────────────
// 横断的関心事（Middleware / 認証）
// Cookie の JWT を検証し、通れば c.set("userId", ...) で後段に渡す。
// 保護したいルートにだけ差し込んで使う（例：.get("/me", authMiddleware, ...)）。
// ─────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export const authMiddleware = createMiddleware<{
  Variables: { userId: number };
}>(async (c, next) => {
  const token = getCookie(c, "token");
  if (!token) {
    return c.json({ error: "ログインが必要です" }, 401);
  }

  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    // sub に入れたユーザーIDを取り出して後段へ。
    c.set("userId", Number(payload.sub));
  } catch {
    // 署名不正・期限切れなど。
    return c.json({ error: "セッションが無効です。再ログインしてください" }, 401);
  }

  await next();
});
