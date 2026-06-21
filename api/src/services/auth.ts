import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import * as usersRepository from "../repositories/users";
import type { User } from "../db/schema";

// ─────────────────────────────────────────────
// ビジネスロジック層（Service / auth）
// 「登録・ログインという業務として何をするか」を担当する。
// フレームワーク(Hono)や HTTP の詳細はなるべく持ち込まない。
//   - パスワードのハッシュ化／照合（bcrypt）
//   - JWT の発行
//   - 業務エラー（重複・認証失敗）の判定
// ─────────────────────────────────────────────

// 認証まわりの業務エラー。route 側ではなく onError でHTTPに変換する。
export class AuthError extends Error {
  constructor(
    message: string,
    public status: 400 | 401 | 409,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const TOKEN_TTL_SEC = 60 * 60 * 24 * 7; // 7日

// API レスポンスで外に出してよいユーザー情報（password_hash は絶対に含めない）。
export type PublicUser = {
  id: number;
  email: string;
};

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, email: user.email };
}

// JWT を発行する。sub にユーザーIDを入れる。
export function issueToken(userId: number): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return sign(
    { sub: userId, iat: now, exp: now + TOKEN_TTL_SEC },
    JWT_SECRET,
    "HS256",
  );
}

// 入力の最低限のバリデーション（本番は zod 等に置き換える想定）。
function validate(email: string, password: string) {
  if (!email || !email.includes("@")) {
    throw new AuthError("有効なメールアドレスを入力してください", 400);
  }
  if (!password || password.length < 8) {
    throw new AuthError("パスワードは8文字以上にしてください", 400);
  }
}

// 新規登録：重複チェック → ハッシュ化 → 作成。
export async function register(
  email: string,
  password: string,
): Promise<PublicUser> {
  validate(email, password);

  // email は UNIQUE 制約でも守られるが、わかりやすいエラーのため事前に確認する。
  const existing = await usersRepository.findByEmail(email);
  if (existing) {
    throw new AuthError("このメールアドレスは既に登録されています", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = await usersRepository.create({ email, passwordHash });

  // 採番された id で取り直す（created_at 等を含めて返すため）。
  const created = await usersRepository.findById(id);
  if (!created) {
    // 直後に消えるのは想定外。サーバエラー扱い。
    throw new Error("登録直後のユーザー取得に失敗しました");
  }
  return toPublicUser(created);
}

// ログイン：ユーザー取得 → パスワード照合 → トークン発行。
// 「ユーザーが居ない」「パスワード違い」は区別せず同じ 401 にする（情報漏れ防止）。
export async function login(
  email: string,
  password: string,
): Promise<{ user: PublicUser; token: string }> {
  const user = await usersRepository.findByEmail(email);
  if (!user) {
    throw new AuthError("メールアドレスまたはパスワードが違います", 401);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AuthError("メールアドレスまたはパスワードが違います", 401);
  }

  const token = await issueToken(user.id);
  return { user: toPublicUser(user), token };
}
