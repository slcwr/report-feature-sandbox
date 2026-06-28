// ─────────────────────────────────────────────
// テーブル共通の見た目（reports 機能内で共有）
// 各テーブルが同じ枠線・余白を使えるよう、スタイルとラッパーをここに集約する。
// 見た目は Tailwind のユーティリティクラスで表現する。
// ─────────────────────────────────────────────
import type { ReactNode } from "react";

export const th = "border border-gray-300 bg-gray-100 p-2 text-left";

export const td = "border border-gray-300 p-2";

// 見出し付きのテーブル枠。中身（thead/tbody）だけ差し込めばよい。
export function Table({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto my-10 max-w-[640px] font-sans">
      <h1>{title}</h1>
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}
