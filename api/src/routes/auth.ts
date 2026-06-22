import { Hono } from "hono";
import * as authService from "../services/auth";
import { authMiddleware } from "../middlewares/auth";
import * as usersRepository from "../repositories/users";

// ─────────────────────────────────────────────
// プレゼンテーション層（Route / auth）
// HTTP のことだけを担当：入力の受け取り、トークンの発行、JSON で返す。
// トークンは body で返し、呼び出し側が Authorization: Bearer で添える運用。
// 業務ロジックは services/auth に委譲する。
//
// ※ RPC を効かせるため、必ずメソッドチェーンで定義する。
// ─────────────────────────────────────────────

export const auth = new Hono()
  // 新規登録：作成して、そのままログイン状態にする。
  .post("/register", async (c) => {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();
    const user = await authService.register(email, password);
    const token = await authService.issueToken(user.id);
    return c.json({ user, token }, 201);
  })
  // ログイン：照合してトークンを body で返す（呼び出し側が Bearer で使う）。
  .post("/login", async (c) => {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();
    const { user, token } = await authService.login(email, password);
    return c.json({ user, token });
  })
  // ログアウト：JWT はステートレスなので、サーバ側で消すものは無い。
  // 実際のログアウトは「クライアントが持っているトークンを破棄する」こと。
  // （即時失効が必要なら、別途トークンの失効リスト等が要る。今回は対象外。）
  .post("/logout", (c) => {
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
