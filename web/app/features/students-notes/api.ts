import { hc } from "hono/client";
import { UnauthorizedError } from "~/features/auth/errors";
import type { AppType } from "../../../../api/src/index";

const apiUrl = process.env.API_URL ?? "http://localhost:8787";

// Hono RPC クライアント。fetch の代わりにメソッド呼び出しで api を叩く。
const client = hc<AppType>(apiUrl);

export async function getStudentsNotes(token: string, studentId: number, page: number, limit: number) {
  // 保護された API なので、session に保存しておいた JWT を Bearer で添える。
  const headers = { Authorization: `Bearer ${token}` };
  // パスの :student_id は param、ページネーションは query で渡す。
  // Hono RPC では param / query とも文字列なので String() で変換する。
  const res = await client.api.notes.notes[":student_id"].$get(
    {
      param: { student_id: String(studentId) },
      query: { page: String(page), limit: String(limit) },
    },
    { headers },
  );
  // アクセストークン切れ。withAuth が捕捉して /refresh → リトライする。
  // 401 はミドルウェアが返すため RPC の型には現れない。number で比較する。
  if ((res.status as number) === 401) throw new UnauthorizedError();
  return res.json();
}

// ノートを新規作成する。author_id は api 側で JWT から補うので送らない。
export async function createStudentNote(
  token: string,
  input: { student_id: number; body: string; status: "open" | "in_progress" | "done" },
) {
  const headers = { Authorization: `Bearer ${token}` };
  const res = await client.api.notes.notes.$post({ json: input }, { headers });
  // 401 を最初に判定する。!res.ok を先に置くと 401 も汎用 Error になり、
  // withAuth が UnauthorizedError を捕捉できず自動リフレッシュが効かなくなる。
  if ((res.status as number) === 401) throw new UnauthorizedError();
  if (!res.ok) throw new Error("ノートの作成に失敗しました");
  return res.json();
}
