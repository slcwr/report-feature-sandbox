import { hc } from "hono/client";
import type { AppType } from "../../../../api/src/index";


const apiUrl = process.env.API_URL ?? "http://localhost:8787";

// Hono RPC クライアント。fetch の代わりにメソッド呼び出しで api を叩く。
const client = hc<AppType>(apiUrl);

export async function getStudentsNotes(token: string, studentId: number, page: number, limit: number) {
  // 保護された API なので、session に保存しておいた JWT を Bearer で添える。
  const headers = { Authorization: `Bearer ${token}` };
  // パスの :student_id は param、ページネーションは query で渡す。
  // Hono RPC では param / query とも文字列なので String() で変換する。
  const notesByStudentId = await client.api.notes.notes[":student_id"]
    .$get(
      {
        param: { student_id: String(studentId) },
        query: { page: String(page), limit: String(limit) },
      },
      { headers },
    )
    .then((res) => res.json());
  return notesByStudentId;
}

// ノートを新規作成する。author_id は api 側で JWT から補うので送らない。
export async function createStudentNote(
  token: string,
  input: { student_id: number; body: string; status: "open" | "in_progress" | "done" },
) {
  const headers = { Authorization: `Bearer ${token}` };
  const res = await client.api.notes.notes.$post({ json: input }, { headers });
  return res.json();
}
