// ─────────────────────────────────────────────
// フォローアップ対象生徒テーブルのUI（平均進捗が低い生徒）
// ─────────────────────────────────────────────
import { Table, td, th } from "~/shared/components/table";
import type { AtRiskStudentRow } from "../types";


export function AtRiskTable({ rows }: { rows: AtRiskStudentRow[] }) {
  return (
    <Table title="フォローアップ対象生徒">
      <thead>
        <tr>
          <th className={th}>生徒</th>
          <th className={th}>学校</th>
          <th className={th}>進捗率(%)</th>
          <th className={th}>視聴数</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.student_id}>
            <td className={td}>{row.student_id}</td>
            <td className={td}>{row.school_id}</td>
            <td className={td}>{row.avg_progress}</td>
            <td className={td}>{row.watched}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
