// ─────────────────────────────────────────────
// レポート表示ルート（薄く保つ / FSD の routes 層）
// ここは「features を呼ぶだけ」。データ取得は features/reports/api、
// 表示は features/reports/components に任せる。
// ─────────────────────────────────────────────

import { getReports } from "~/features/reports/api";
import { AtRiskTable } from "~/features/reports/components/AtRiskTable";
import { CompletionTable } from "~/features/reports/components/CompletionTable";
import { VideoRankingTable } from "~/features/reports/components/VideoRankingTable";
import type { Route } from "./+types/reports";
import { requireUser } from "~/features/auth/require-auth.server";

// loader：サーバー側で実行され、features の api からレポートデータを取得する
export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request); // 未ログインなら requireUser 内の throw redirect("/login") でここで中断
  return getReports();
}

// 画面：loader が取ったデータを features のコンポーネントに渡すだけ
export default function Reports({ loaderData }: Route.ComponentProps) {
  const { completionBySchool, videoRanking, atRiskStudent } = loaderData;

  return (
    <>
      <CompletionTable rows={completionBySchool} />
      <VideoRankingTable rows={videoRanking} />
      <AtRiskTable rows={atRiskStudent} />
    </>
  );
}
