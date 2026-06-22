import { redirect } from "react-router";
import { getSession } from "./session.server";

// 戻り値型を明示して固定する（session の中身は token のみ）。
export async function requireUser(
  request: Request,
): Promise<{ token: string }> {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) throw redirect("/login"); // 未ログインならログイン画面へ
  return { token };
}
