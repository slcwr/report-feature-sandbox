import { Hono } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import type { Context } from "hono";
import * as authService from "../services/auth";
import { authMiddleware } from "../middlewares/auth";
import * as usersRepository from "../repositories/users";

// ─────────────────────────────────────────────
// プレゼンテーション層（Route / auth）
// HTTP のことだけを担当：入力の受け取り、Cookie の付与、JSON で返す。
// 業務ロジックは services/auth に委譲する。
//
// ※ RPC を効かせるため、必ずメソッドチェーンで定義する。
// ─────────────────────────────────────────────

const COOKIE_NAME = "token";
const TOKEN_TTL_SEC = 60 * 60 * 24 * 7; // 7日（service 側の TTL と揃える）

// JWT を HttpOnly Cookie として付与する（JS から読めない＝XSS に強い）。
function setAuthCookie(c: Context, token: string) {
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: TOKEN_TTL_SEC,
    // 本番(HTTPS)でのみ secure を立てる。ローカルは http なので false。
    secure: process.env.NODE_ENV === "production",
  });
}

export const auth = new Hono()
  // 新規登録：作成して、そのままログイン状態にする。
  .post("/register", async (c) => {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();
    const user = await authService.register(email, password);
    const token = await authService.issueToken(user.id);
    setAuthCookie(c, token);
    return c.json({ user }, 201);
  })
  // ログイン：照合してトークンを Cookie に。
  .post("/login", async (c) => {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();
    const { user, token } = await authService.login(email, password);
    setAuthCookie(c, token);
    return c.json({ user });
  })
  // ログアウト：Cookie を消すだけ（JWT はステートレスなので即時失効はしない点に注意）。
  .post("/logout", (c) => {
    deleteCookie(c, COOKIE_NAME, { path: "/" });
    return c.json({ ok: true });
  })
  // 自分の情報：authMiddleware を通過した時だけ届く。
  .get("/me", authMiddleware, async (c) => {
    const userId = c.get("userId");
    const user = await usersRepository.findById(userId);
    if (!user) {
      return c.json({ error: "ユーザーが見つかりません" }, 404);
    }
    return c.json({ user: authService.toPublicUser(user) });
  });
