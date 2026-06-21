// ─────────────────────────────────────────────
// api を呼ぶ処理（データ取得）
// route(loader) から「どう取るか」を切り離し、ここに閉じ込める。
// Hono RPC クライアントの生成と、3 本のレポート取得をまとめて担当する。
// ─────────────────────────────────────────────
import { hc } from "hono/client";
// api 側がエクスポートしている型だけを import（型なので実行時には消える）。
// これにより client.api.reports[...] が型安全になり、URL の打ち間違いも防げる。
import type { AppType } from "../../../../api/src/index";
// web 側の「契約」となる行の型（features 内の葉）。
// 戻り値の型注釈に使うことで、依存の向きを api → types（下向き）に保ちつつ、
// hc<AppType> の推論結果がこの契約に適合するかを TS にチェックさせる。
import type { AtRiskStudentRow, CompletionBySchoolRow, VideoRankingRow } from "./types";

// サーバー間通信なので、ブラウザ用の localhost ではなく
// docker のサービス名 api を使う（環境変数 API_URL で渡している）。
const apiUrl = process.env.API_URL ?? "http://localhost:8787";

// Hono RPC クライアント。fetch の代わりにメソッド呼び出しで api を叩く。
const client = hc<AppType>(apiUrl);

// 3 本のレポートをまとめて取得する。
// route はこの 1 関数を呼ぶだけでよくなる。
// 戻り値の型を明示することで、api が非互換に変わると（hc の推論結果が
// 下の型に代入できなくなり）ここでコンパイルエラーになる＝ドリフト検知。
export async function getReports(): Promise<{
  completionBySchool: CompletionBySchoolRow[];
  videoRanking: VideoRankingRow[];
  atRiskStudent: AtRiskStudentRow[];
}> {
  const [completionBySchool, videoRanking, atRiskStudent] = await Promise.all([
    client.api.reports["completion-by-school"].$get().then((res) => res.json()),
    client.api.reports["video-ranking"].$get().then((res) => res.json()),
    client.api.reports["at-risk-students"].$get().then((res) => res.json()),
  ]);

  return { completionBySchool, videoRanking, atRiskStudent };
}
