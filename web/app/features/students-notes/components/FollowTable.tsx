// ─────────────────────────────────────────────
// 学習フォローアップメモのUI
// ─────────────────────────────────────────────
import { useState } from "react";
import { Form, useSearchParams } from "react-router";
import { Modal } from "~/shared/components/modal";
import { Table } from "~/shared/components/table";
import type { StudentNotesResponse } from "../types";

// セル・フォーム要素のスタイルは Tailwind のユーティリティクラスで表現する。
const th = "border border-gray-300 bg-gray-100 p-2 text-left";
const td = "border border-gray-300 p-2";
const field = "mb-4 block";
const labelText = "mb-1 block text-sm";
const input = "w-full box-border rounded-md border border-gray-300 p-2 text-sm";
const button =
  "rounded-md bg-blue-600 px-4 py-2 text-sm text-white cursor-pointer hover:bg-blue-700";
// ページネーションの「前へ／次へ」ボタン。無効時は薄く＋カーソル無効。
const pagerButton =
  "rounded-md border border-gray-300 px-3 py-1 text-sm cursor-pointer hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40";

export function FollowTable({ data }: { data: StudentNotesResponse | null }) {
  const [_, setSearchParams] = useSearchParams();
  // モーダルの開閉状態。ボタンで開き、× / 背景クリックで閉じる。
  const [open, setOpen] = useState(false);
  const rows = data?.items ?? [];

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) });
  };

  return (
    <>
      <Table title="フォローアップメモ">
        <thead>
          <tr>
            <th className={th}>生徒</th>
            <th className={th}>フォロー内容</th>
            <th className={th}>状況</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.student_id}>
                <td className={td}>{row.student_id}</td>
                <td className={td}>{row.body}</td>
                <td className={td}>{row.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={td} colSpan={3}>
                メモがありません
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {/* ページネーション UI（ページが2つ以上あるときだけ表示） */}
      {data && data.pagination.totalPages > 1 && (
        <div className="my-4 flex items-center justify-center gap-4">
          <button
            type="button"
            className={pagerButton}
            onClick={() => handlePageChange(data.pagination.page - 1)}
            disabled={!data.pagination.hasPrev}
          >
            前へ
          </button>

          <span className="text-sm text-gray-600">
            {data.pagination.page} / {data.pagination.totalPages}
          </span>

          <button
            type="button"
            className={pagerButton}
            onClick={() => handlePageChange(data.pagination.page + 1)}
            disabled={!data.pagination.hasNext}
          >
            次へ
          </button>
        </div>
      )}

      <button
        type="button"
        className={`mx-auto mb-10 block ${button}`}
        onClick={() => setOpen(true)}
      >
        新規作成
      </button>

      <Modal open={open} title="フォローアップメモの新規作成" onClose={() => setOpen(false)}>
        {/* 送信先はこのルートの action（POST）。送信したらモーダルを閉じる。 */}
        <Form method="post" onSubmit={() => setOpen(false)}>
          <label className={field}>
            <span className={labelText}>フォロー内容</span>
            <textarea name="body" rows={4} className={input} required />
          </label>
          <label className={field}>
            <span className={labelText}>状況</span>
            <select name="status" defaultValue="open" className={input}>
              <option value="open">未対応</option>
              <option value="in_progress">対応中</option>
              <option value="done">完了</option>
            </select>
          </label>
          <button type="submit" className={button}>
            登録する
          </button>
        </Form>
      </Modal>
    </>
  );
}
