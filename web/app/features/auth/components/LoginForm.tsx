import { Form, useNavigation } from "react-router";
import type { LoginActionResult } from "../types";

// ───────────────────────────────────────────────
// ログインフォームのUI。
// 表示に専念し、データ取得や認証ロジックは持たない（責務分離）。
// 送信は React Router の <Form> が action に渡す。
// 認証失敗時のエラーは、props で受け取って表示する。
// ───────────────────────────────────────────────

type LoginFormProps = {
  // action が返したエラー（あれば表示）。なければ undefined。
  actionResult?: LoginActionResult;
};

export function LoginForm({ actionResult }: LoginFormProps) {
  // 送信中かどうか（ボタンの二重押し防止・表示切り替えに使う）
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post" style={formStyle}>
      <h1 style={titleStyle}>ログイン</h1>

      {/* 認証失敗時のエラー表示 */}
      {actionResult?.error ? (
        <p style={errorStyle} role="alert">
          {actionResult.error}
        </p>
      ) : null}

      <label style={labelStyle}>
        メールアドレス
        <input type="email" name="email" required autoComplete="email" style={inputStyle} />
      </label>

      <label style={labelStyle}>
        パスワード
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          style={inputStyle}
        />
      </label>

      <button type="submit" disabled={isSubmitting} style={buttonStyle}>
        {isSubmitting ? "ログイン中..." : "ログイン"}
      </button>
    </Form>
  );
}

// スタイル（このコンポーネントに凝集。後でTailwindに置き換えてもよい）
const formStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "16px",
  maxWidth: 360,
  margin: "60px auto",
  padding: "32px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontFamily: "system-ui",
};
const titleStyle = { margin: 0, fontSize: "1.5rem" };
const labelStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "6px",
  fontSize: "0.9rem",
};
const inputStyle = {
  padding: "8px",
  fontSize: "1rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
};
const buttonStyle = {
  padding: "10px",
  fontSize: "1rem",
  color: "#fff",
  background: "#2563eb",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
const errorStyle = {
  margin: 0,
  padding: "8px 12px",
  color: "#b91c1c",
  background: "#fee2e2",
  borderRadius: "4px",
  fontSize: "0.9rem",
};
