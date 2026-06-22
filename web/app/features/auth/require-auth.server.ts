import { redirect } from "react-router";
import { getSession } from "./session.server";

export async function requireUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) throw redirect("/login"); // 未ログインならログイン画面へ
  return { token };
}
