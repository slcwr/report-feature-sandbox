// ─────────────────────────────────────────────
// テーブル共通の見た目（reports 機能内で共有）
// 各テーブルが同じ枠線・余白を使えるよう、スタイルとラッパーをここに集約する。
// ─────────────────────────────────────────────
import type { ReactNode } from "react";

export const th = {
  border: "1px solid #ccc",
  padding: "8px",
  background: "#f4f4f4",
  textAlign: "left" as const,
};

export const td = { border: "1px solid #ccc", padding: "8px" };

// 見出し付きのテーブル枠。中身（thead/tbody）だけ差し込めばよい。
export function Table({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 640, margin: "40px auto" }}>
      <h1>{title}</h1>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>{children}</table>
    </div>
  );
}
