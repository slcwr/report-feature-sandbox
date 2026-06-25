import { hc } from "hono/client";
import type { AppType } from "../../../../api/src/index";

const apiUrl = process.env.API_URL ?? "http://localhost:8787";

// Hono RPC クライアント。fetch の代わりにメソッド呼び出しで api を叩く。
const client = hc<AppType>(apiUrl);

export async function getStudentsNotes(token: string, studentId: number) {
  // 保護された API なので、session に保存しておいた JWT を Bearer で添える。
  const headers = { Authorization: `Bearer ${token}` };
  // /api/notes/notes/:id を叩く。:id は [":id"] でアクセスし、値は param で渡す。
  // Hono RPC では param は文字列なので String() で変換する。
  const notesByStudentId = await client.api.notes.notes[":id"]
    .$get({ param: { id: String(studentId) } }, { headers })
    .then((res) => res.json());

  return notesByStudentId;
}
