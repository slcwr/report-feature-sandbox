// ─────────────────────────────────────────────
// レポート表示ルートのサンプル
// loader が api(Hono) を呼び、その結果を画面に表示する。
// ─────────────────────────────────────────────
import type { Route } from "./+types/reports";
import { hc } from "hono/client";
// api 側がエクスポートしている型だけを import（型なので実行時には消える）。
// これにより client.api.reports[...] が型安全になり、URL の打ち間違いも防げる。
import type { AppType } from "../../../api/src/index";

// loader：サーバー側で実行され、api からレポートデータを取得する
export async function loader() {
  // サーバー間通信なので、ブラウザ用の localhost ではなく
  // docker のサービス名 api を使う（環境変数 API_URL で渡している）
  const apiUrl = process.env.API_URL ?? "http://localhost:8787";

  // Hono RPC クライアント。fetch の代わりにメソッド呼び出しで api を叩く。
  const client = hc<AppType>(apiUrl);

  const completionBySchoolres = await client.api.reports["completion-by-school"].$get();
  const completionBySchool = await completionBySchoolres.json();

  const videoRankingres = await client.api.reports["video-ranking"].$get();
  const videoRanking = await videoRankingres.json();

  return { completionBySchool, videoRanking };
}

// 画面：loader が取ったデータを props 経由で受け取って表示
export default function Reports({ loaderData }: Route.ComponentProps) {
  const { completionBySchool, videoRanking } = loaderData;

  return (
    <>
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
    <div style={{ fontFamily: "system-ui", maxWidth: 640, margin: "40px auto" }}>
      <h1>動画ランキング</h1>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={th}>動画タイトル</th>
            <th style={th}>視聴数</th>
            <th style={th}>進捗率(%)</th>
          </tr>
        </thead>
        <tbody>
          {videoRanking.map((row: any) => (
            <tr key={row.school_id}>
              <td style={td}>{row.video_title}</td>
              <td style={td}>{row.views}</td>
              <td style={td}>{row.avg_progress}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

const th = { border: "1px solid #ccc", padding: "8px", background: "#f4f4f4", textAlign: "left" as const };
const td = { border: "1px solid #ccc", padding: "8px" };
