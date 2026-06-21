import { hc } from "hono/client";
import type { AppType } from "../../../../api/src";

const apiUrl = process.env.API_URL ?? "http://localhost:8787";
const client = hc<AppType>(apiUrl);

// ログイン：成功したら user を、失敗したら null を返す。
// 「フォームにどう返すか（エラー文言・リダイレクト）」は action 側の責務なので、
// ここでは LoginActionResult は使わない。
export async function login(email: string, password: string) {
  const res = await client.api.auth.login.$post({ json: { email, password } });
  if (!res.ok) return null;
  const { user } = await res.json();
  return user;
}
