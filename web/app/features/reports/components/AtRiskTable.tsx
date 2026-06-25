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
          <th style={th}>生徒</th>
          <th style={th}>学校</th>
          <th style={th}>進捗率(%)</th>
          <th style={th}>視聴数</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.student_id}>
            <td style={td}>{row.student_id}</td>
            <td style={td}>{row.school_id}</td>
            <td style={td}>{row.avg_progress}</td>
            <td style={td}>{row.watched}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
