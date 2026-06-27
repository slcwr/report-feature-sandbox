// ─────────────────────────────────────────────
// 学習フォローアップメモのUI
// ─────────────────────────────────────────────
import { useState } from "react";
import { Form } from "react-router";
import { Modal } from "~/shared/components/modal";
import { Table, td, th } from "~/shared/components/table";
import type { StudentNotesRow } from "../types";

// フォームの各要素のスタイル（th / td と同じくインライン style オブジェクト）。
const field = { display: "block", marginBottom: "16px" };
const labelText = { display: "block", marginBottom: "4px", fontSize: "14px" };
const input = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
};
const submit = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "6px",
  background: "#2563eb",
  color: "#fff",
  fontSize: "14px",
  cursor: "pointer",
};

// 「新規作成」ボタンの見た目。th / td と同じくインラインの style オブジェクトで持つ。
const newButton = {
  display: "block",
  margin: "0 auto 40px",
  padding: "8px 16px",
  border: "none",
  borderRadius: "6px",
  background: "#2563eb",
  color: "#fff",
  fontSize: "14px",
  cursor: "pointer",
};

export function FollowTable({ rows }: { rows: StudentNotesRow[] | null }) {
  // モーダルの開閉状態。ボタンで開き、× / 背景クリックで閉じる。
  const [open, setOpen] = useState(false);

  return (
    <>
      <Table title="フォローアップメモ">
        <thead>
          <tr>
            <th style={th}>生徒</th>
            <th style={th}>フォロー内容</th>
            <th style={th}>状況</th>
          </tr>
        </thead>
        <tbody>
          {rows && rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.student_id}>
                <td style={td}>{row.student_id}</td>
                <td style={td}>{row.body}</td>
                <td style={td}>{row.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td style={td} colSpan={3}>
                メモがありません
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <button type="button" style={newButton} onClick={() => setOpen(true)}>
        新規作成
      </button>

      <Modal open={open} title="フォローアップメモの新規作成" onClose={() => setOpen(false)}>
        {/* 送信先はこのルートの action（POST）。送信したらモーダルを閉じる。 */}
        <Form method="post" onSubmit={() => setOpen(false)}>
          <label style={field}>
            <span style={labelText}>フォロー内容</span>
            <textarea name="body" rows={4} style={input} required />
          </label>
          <label style={field}>
            <span style={labelText}>状況</span>
            <select name="status" defaultValue="open" style={input}>
              <option value="open">未対応</option>
              <option value="in_progress">対応中</option>
              <option value="done">完了</option>
            </select>
          </label>
          <button type="submit" style={submit}>
            登録する
          </button>
        </Form>
      </Modal>
    </>
  );
}
