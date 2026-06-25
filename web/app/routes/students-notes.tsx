import { FollowTable } from "~/features/students-notes/components/FollowTable";
import { getStudentsNotes } from "~/features/students-notes/api";
import { requireUser } from "~/features/auth/require-auth.server";
import type { Route } from "./+types/students-notes";

// loader：サーバー側で実行され、features の api からノートデータを取得する
export async function loader({ request, params }: Route.LoaderArgs) {
  // 未ログインなら requireUser 内の throw redirect("/login") でここで中断。
  const { token } = await requireUser(request);
  // URL の /students/:studentId/notes から生徒IDを取り出す（文字列なので数値へ）。
  const studentId = Number(params.studentId);
  return getStudentsNotes(token, studentId);
}

export default function StudentsNotes({ loaderData }: Route.ComponentProps) {
  return <FollowTable row={loaderData ?? null} />;
}
