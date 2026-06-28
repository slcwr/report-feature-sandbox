// ─────────────────────────────────────────────
// 完了率テーブルのUI（学校別の完了率）
// データは props で受け取るだけ。取得方法（api）は知らない。
// ─────────────────────────────────────────────
import { Table, td, th } from "~/shared/components/table";
import type { CompletionBySchoolRow } from "../types";

export function CompletionTable({ rows }: { rows: CompletionBySchoolRow[] }) {
  return (
    <Table title="学校別 完了率レポート">
      <thead>
        <tr>
          <th className={th}>学校</th>
          <th className={th}>視聴数</th>
          <th className={th}>完了率(%)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.school_id}>
            <td className={td}>{row.school_id}</td>
            <td className={td}>{row.total_views}</td>
            <td className={td}>{row.completion_rate}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
