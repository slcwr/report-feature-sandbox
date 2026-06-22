import { hc } from "hono/client";
import type { AppType } from "../../../../api/src";

const apiUrl = process.env.API_URL ?? "http://localhost:8787";
const client = hc<AppType>(apiUrl);

// ログイン：成功したら { user, token } を、失敗したら null を返す。
// token は action 側で session に保存し、以降の API 呼び出しで Bearer として使う。
// 「フォームにどう返すか（エラー文言・リダイレクト）」は action 側の責務なので、
// ここでは LoginActionResult は使わない。
export async function login(email: string, password: string) {
  const res = await client.api.auth.login.$post({ json: { email, password } });
  if (!res.ok) return null;
  return await res.json(); // { user, token }
}

// 新規登録：成功したら { user, token } を、失敗したら null を返す。
// login と同じく token を session に保存して、そのままログイン状態にする。
export async function register(email: string, password: string) {
  const res = await client.api.auth.register.$post({ json: { email, password } });
  if (!res.ok) return null;
  return await res.json(); // { user, token }
}