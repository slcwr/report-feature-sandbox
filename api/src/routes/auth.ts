import { Hono } from "hono";
import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import * as authService from "../services/auth";
import { REFRESH_TTL_SEC } from "../services/auth";
import { authMiddleware } from "../middlewares/auth";
import * as usersRepository from "../repositories/users";
import { config } from "../config";

// ─────────────────────────────────────────────
// プレゼンテーション層（Route / auth）
// HTTP のことだけを担当：入力の受け取り、トークンの発行、JSON で返す。
//   - アクセストークン … JWT(15分)。body で返し、呼び出し側が Authorization: Bearer で使う。
//   - リフレッシュトークン … 不透明値(30日)。httpOnly Cookie で受け渡す（JS から読めない＝XSS耐性）。
//
// ※ RPC を効かせるため、必ずメソッドチェーンで定義する。
// ─────────────────────────────────────────────

// リフレッシュトークンを載せる Cookie 名。
const REFRESH_COOKIE = "refresh_token";

// リフレッシュ用 Cookie をセットする。
//   - httpOnly … JS から読めない（XSS でトークンを盗めない）
//   - path     … /api/auth 配下のみに送る（毎リクエストでは飛ばさない）
//   - secure   … 本番のみ（ローカル http では付けると送られないため config で制御）
//   - sameSite … Lax。フロントと API が同一サイト(localhost)なら送られる。
//                別ドメイン運用にするなら "None"+secure が必要。
function setRefreshCookie(c: Context, token: string) {
  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: "Lax",
    path: "/api/auth",
    maxAge: REFRESH_TTL_SEC,
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
    const accessToken = await authService.issueToken(user.id);
    const refreshToken = await authService.issueRefreshToken(user.id);
    setRefreshCookie(c, refreshToken);
    return c.json({ user, accessToken }, 201);
  })
  // ログイン：照合してアクセストークンを body、リフレッシュトークンを Cookie で返す。
  .post("/login", async (c) => {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();
    const { user, accessToken, refreshToken } = await authService.login(
      email,
      password,
    );
    setRefreshCookie(c, refreshToken);
    return c.json({ user, accessToken });
  })
  // リフレッシュ：Cookie のリフレッシュトークンを検証＆ローテーションし、新アクセストークンを返す。
  .post("/refresh", async (c) => {
    const raw = getCookie(c, REFRESH_COOKIE);
    if (!raw) {
      return c.json({ error: "セッションがありません。ログインしてください" }, 401);
    }
    const { accessToken, refreshToken } =
      await authService.rotateRefreshToken(raw);
    setRefreshCookie(c, refreshToken); // ローテーション後の新トークンで上書き
    return c.json({ accessToken });
  })
  // ログアウト：リフレッシュトークンを DB で失効させ、Cookie も消す。
  .post("/logout", async (c) => {
    const raw = getCookie(c, REFRESH_COOKIE);
    if (raw) {
      await authService.logout(raw);
    }
    deleteCookie(c, REFRESH_COOKIE, { path: "/api/auth" });
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
