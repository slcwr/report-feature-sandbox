// features/auth/types.ts
// ログイン機能で使う型。前回の議論の通り、何もimportせず素直に定義する（型は起点）。

// ── ログイン成功時に api が返すユーザー情報 ──
// Honoの /api/login が返す形と一致させる。
export type AuthUser = {
  id: number;
  name: string;
};

// ── ログインフォームの入力 ──
// メールとパスワード。検証やactionで使う。
export type LoginInput = {
  email: string;
  password: string;
};

// ── action の戻り値（フォームに返すエラー）──
// 認証失敗時に { error: "..." } を返す。成功時はリダイレクトするので、
// コンポーネントが受け取るのはエラー時だけ。
export type LoginActionResult = {
  error: string;
};

// ── セッション（cookie）に保存する中身 ──
// session.server.ts の SessionData と一致させる。
// 必要最小限だけ持つ（cookieは4KB制限があり、機密も載せない）。
export type SessionData = {
  userId: number;
};
