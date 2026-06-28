// ─────────────────────────────────────────────
// 汎用モーダル（オーバーレイ + 中央のパネル）
// open で表示/非表示を切り替え、背景クリックと×ボタンで onClose を呼ぶ。
// 見た目は Tailwind のユーティリティクラスで表現する。
// ─────────────────────────────────────────────
import type { ReactNode } from "react";

const overlay = "fixed inset-0 z-[1000] flex items-center justify-center";

// 背景（オーバーレイ）。クリックで閉じるので、操作可能な本物の <button> にする。
const backdrop = "absolute inset-0 cursor-default border-none bg-black/40";

const panel =
  "relative z-10 w-[min(90vw,480px)] rounded-lg bg-white p-6 font-sans shadow-[0_10px_30px_rgba(0,0,0,0.2)]";

const header = "mb-4 flex items-center justify-between";

const closeButton = "cursor-pointer border-none bg-transparent text-xl leading-none";

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
    <div className={overlay}>
      {/* 背景クリックで閉じる、画面全体を覆う透明ボタン。パネルの背面に置く。 */}
      <button type="button" className={backdrop} aria-label="閉じる" onClick={onClose} />
      <div
        className={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <div className={header}>
          <h2 className="m-0 text-lg">{title}</h2>
          <button
            type="button"
            className={closeButton}
            aria-label="閉じる"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
