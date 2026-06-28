// ─────────────────────────────────────────────
// アプリ実行時の設定（環境変数の読み込み・検証）
// ここはモジュール読み込み時（＝起動時）に1回だけ走る。
// 必須の環境変数が無ければ起動時に即落とす（fail-fast）ことで、
// 「設定ミスのまま動いて、最初のリクエストで500」を防ぐ。
//
// ※ drizzle.config.ts は drizzle-kit(CLI)専用なので、ここからは参照しない。
// ─────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export const config = {
  // 型は string（undefined ではない）。使う側での null チェックは不要。
  jwtSecret: JWT_SECRET,
} as const;
