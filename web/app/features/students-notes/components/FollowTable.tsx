// ─────────────────────────────────────────────
// 学習フォローアップメモのUI
// ─────────────────────────────────────────────
import { Table, td, th } from "~/shared/components/table";
import type { StudentNotesRow } from "../types";

export function FollowTable({ row }: { row: StudentNotesRow | null }) {
  return (
    <Table title="フォローアップメモ">
      <thead>
        <tr>
          <th style={th}>生徒</th>
          <th style={th}>フォロー内容</th>
          <th style={th}>状況</th>
        </tr>
      </thead>
      <tbody>
        {row ? (
          <tr>
            <td style={td}>{row.student_id}</td>
            <td style={td}>{row.body}</td>
            <td style={td}>{row.status}</td>
          </tr>
        ) : (
          <tr>
            <td style={td} colSpan={3}>
              メモがありません
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
