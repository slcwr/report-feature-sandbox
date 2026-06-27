import { redirect } from "react-router";
import { FollowTable } from "~/features/students-notes/components/FollowTable";
import { createStudentNote, getStudentsNotes } from "~/features/students-notes/api";
import { requireUser } from "~/features/auth/require-auth.server";
import type { Route } from "./+types/students-notes";

// loader：サーバー側で実行され、features の api からノートデータを取得する
export async function loader({ request, params }: Route.LoaderArgs) {
  // 未ログインなら requireUser 内の throw redirect("/login") でここで中断。
  const { token } = await requireUser(request);
  // URL の /students/:studentId/notes から生徒IDを取り出す（文字列なので数値へ）。
  const studentId = Number(params.studentId);
  console.log("params",params);
  return getStudentsNotes(token, studentId);
}

// action：フォーム送信（POST）を受け、API にノートを作成する。
export async function action({ request, params }: Route.ActionArgs) {
  const { token } = await requireUser(request);
  const studentId = Number(params.studentId);
  console.log("studentId", studentId);

  const formData = await request.formData();
  const body = String(formData.get("body") ?? "");
  const status = String(formData.get("status") ?? "open") as "open" | "in_progress" | "done";

  await createStudentNote(token, { student_id: studentId, body, status });

  // 同じ URL にリダイレクトして loader を再実行（作成したノートを反映）。
  return redirect(`/students-notes/${studentId}`);
}

export default function StudentsNotes({ loaderData }: Route.ComponentProps) {
  return <FollowTable rows={loaderData ?? null} />;
}
