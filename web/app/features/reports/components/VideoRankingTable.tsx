// ─────────────────────────────────────────────
// 動画ランキングテーブルのUI
// ─────────────────────────────────────────────
import { Table, td, th } from "~/shared/components/table";
import type { VideoRankingRow } from "../types";

export function VideoRankingTable({ rows }: { rows: VideoRankingRow[] }) {
  return (
    <Table title="動画ランキング">
      <thead>
        <tr>
          <th style={th}>動画タイトル</th>
          <th style={th}>視聴数</th>
          <th style={th}>進捗率(%)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.video_title}>
            <td style={td}>{row.video_title}</td>
            <td style={td}>{row.views}</td>
            <td style={td}>{row.avg_progress}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
