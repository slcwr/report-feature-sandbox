// ─────────────────────────────────────────────
// 汎用モーダル（オーバーレイ + 中央のパネル）
// open で表示/非表示を切り替え、背景クリックと×ボタンで onClose を呼ぶ。
// 見た目は table.tsx と同じくインラインの style オブジェクトで持つ。
// ─────────────────────────────────────────────
import type { ReactNode } from "react";

const overlay = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const panel = {
  fontFamily: "system-ui",
  background: "#fff",
  borderRadius: "8px",
  padding: "24px",
  width: "min(90vw, 480px)",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
};

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "16px",
};

const closeButton = {
  border: "none",
  background: "transparent",
  fontSize: "20px",
  lineHeight: 1,
  cursor: "pointer",
};

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  // 閉じている間は何も描画しない。
  if (!open) return null;

  return (
    // 背景（オーバーレイ）クリックで閉じる。
    <div
      style={overlay}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      {/* パネル内のクリックは背景に伝播させない（＝閉じない）。 */}
      <div
        style={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={header}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>{title}</h2>
          <button type="button" style={closeButton} aria-label="閉じる" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
