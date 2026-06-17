// ─────────────────────────────────────────────
// レポート表示ルートのサンプル
// web 生成後、このファイルを web/app/routes/reports.tsx として置く。
// （routes.ts に route("reports", "routes/reports.tsx") の登録も必要）
//
// 前の会話で話した「loaderでサーバーからデータを取り、画面に出す」の実物。
// loader が api(Hono) を呼び、その結果を画面に表示する。
// ─────────────────────────────────────────────
import type { Route } from "./+types/reports";

// loader：サーバー側で実行され、api からレポートデータを取得する
export async function loader() {
  // サーバー間通信なので、ブラウザ用の localhost ではなく
  // docker のサービス名 api を使う（環境変数 API_URL で渡している）
  const apiUrl = process.env.API_URL ?? "http://localhost:8787";

  const res = await fetch(`${apiUrl}/api/reports/completion-by-school`);
  const completionBySchool = await res.json();

  return { completionBySchool };
}

// 画面：loader が取ったデータを props 経由で受け取って表示
export default function Reports({ loaderData }: Route.ComponentProps) {
  const { completionBySchool } = loaderData;

  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 640, margin: "40px auto" }}>
      <h1>学校別 完了率レポート</h1>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={th}>学校</th>
            <th style={th}>視聴数</th>
            <th style={th}>完了率(%)</th>
          </tr>
        </thead>
        <tbody>
          {completionBySchool.map((row: any) => (
            <tr key={row.school_id}>
              <td style={td}>{row.school_id}</td>
              <td style={td}>{row.total_views}</td>
              <td style={td}>{row.completion_rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { border: "1px solid #ccc", padding: "8px", background: "#f4f4f4", textAlign: "left" as const };
const td = { border: "1px solid #ccc", padding: "8px" };
