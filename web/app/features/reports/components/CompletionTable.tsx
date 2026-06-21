// ─────────────────────────────────────────────
// 完了率テーブルのUI（学校別の完了率）
// データは props で受け取るだけ。取得方法（api）は知らない。
// ─────────────────────────────────────────────
import type { CompletionBySchoolRow } from "../types";
import { ReportTable, th, td } from "./table";

export function CompletionTable({ rows }: { rows: CompletionBySchoolRow[] }) {
  return (
    <ReportTable title="学校別 完了率レポート">
      <thead>
        <tr>
          <th style={th}>学校</th>
          <th style={th}>視聴数</th>
          <th style={th}>完了率(%)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.school_id}>
            <td style={td}>{row.school_id}</td>
            <td style={td}>{row.total_views}</td>
            <td style={td}>{row.completion_rate}</td>
          </tr>
        ))}
      </tbody>
    </ReportTable>
  );
}
