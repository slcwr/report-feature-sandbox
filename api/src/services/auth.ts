import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import * as usersRepository from "../repositories/users";
import type { User } from "../db/schema";
import * as refreshTokenRepository from "../repositories/refresh_tokens";
import { config } from "../config";
import { createHash, randomBytes } from "node:crypto";

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

const TOKEN_TTL_SEC = 60 * 15; // アクセストークンは15分
// Cookie の maxAge と合わせるため route 側でも使う。
export const REFRESH_TTL_SEC = 60 * 60 * 24 * 30; // 30日

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
    config.jwtSecret,
    "HS256",
  );
}

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

// 生トークンを発行＆DB保存。返すのは生トークン（DBにはハッシュのみ）。
// created_at は defaultNow、revoked_at は null 既定なので渡さない。
export async function issueRefreshToken(userId: number): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000);
  await refreshTokenRepository.create({
    user_id: userId,
    token_hash: hashToken(raw),
    expires_at: expiresAt,
  });
  return raw;
}

// リフレッシュ：検証 → ローテーション（古いものを失効し新規発行）→ 新アクセス＋新リフレッシュを返す。
export async function rotateRefreshToken(
  raw: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const row = await refreshTokenRepository.findByHash(hashToken(raw));
  if (!row) {
    throw new AuthError("セッションが無効です。再ログインしてください", 401);
  }

  // 再利用検知：失効済みの行が再提示された＝盗難の疑い。
  // 安全側に倒し、そのユーザーの有効な全トークンを失効させる。
  if (row.revoked_at) {
    await refreshTokenRepository.revokeAllForUser(row.user_id);
    throw new AuthError("セッションが無効です。再ログインしてください", 401);
  }

  if (row.expires_at < new Date()) {
    throw new AuthError("セッションの有効期限が切れました。再ログインしてください", 401);
  }

  // ローテーション：古い行を失効させ、新しいトークンを発行する。
  await refreshTokenRepository.revoke(row.id);
  const accessToken = await issueToken(row.user_id);
  const refreshToken = await issueRefreshToken(row.user_id);
  return { accessToken, refreshToken };
}

// ログアウト：該当のリフレッシュトークンを失効させる（JWT 側は短命なので放置でよい）。
export async function logout(raw: string): Promise<void> {
  await refreshTokenRepository.revokeByHash(hashToken(raw));
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
): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
  const user = await usersRepository.findByEmail(email);
  if (!user) {
    throw new AuthError("メールアドレスまたはパスワードが違います", 401);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AuthError("メールアドレスまたはパスワードが違います", 401);
  }

  const accessToken = await issueToken(user.id);
  const refreshToken = await issueRefreshToken(user.id)
  return { user: toPublicUser(user), accessToken, refreshToken };
}
