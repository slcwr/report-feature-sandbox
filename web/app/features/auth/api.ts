import { hc } from "hono/client";
import type { AppType } from "../../../../api/src";

const apiUrl = process.env.API_URL ?? "http://localhost:8787";

export const client = hc<AppType>(apiUrl, {
  init: { credentials: "include" },
});

// API レスポンスの Set-Cookie から refresh_token の生値を取り出す。
// BFF ではブラウザに Cookie を渡さず、この値を __session(httpOnly) に保存して使う。
function extractRefreshCookie(res: Response): string | null {
  const setCookies =
    (res.headers as Headers & { getSetCookie?(): string[] }).getSetCookie?.() ?? [];
  for (const sc of setCookies) {
    const m = /^refresh_token=([^;]+)/.exec(sc);
    if (m) return decodeURIComponent(m[1]);
  }
  return null;
}

// ログイン：成功したら { user, accessToken, refresh } を、失敗したら null を返す。
// accessToken は body、refresh は Set-Cookie から取り出す（ボディには載らない）。
export async function login(email: string, password: string) {
  const res = await client.api.auth.login.$post({ json: { email, password } });
  if (!res.ok) return null;
  const body = await res.json(); // { user, accessToken }
  const refresh = extractRefreshCookie(res);
  if (!refresh) return null;
  return { ...body, refresh };
}

// 新規登録：login と同じく { user, accessToken, refresh } を返す。
export async function register(email: string, password: string) {
  const res = await client.api.auth.register.$post({ json: { email, password } });
  if (!res.ok) return null;
  const body = await res.json(); // { user, accessToken }
  const refresh = extractRefreshCookie(res);
  if (!refresh) return null;
  return { ...body, refresh };
}

// リフレッシュ：保持中の refresh を Cookie ヘッダで手動添付して /refresh を呼ぶ（BFF）。
// 成功したら新しい { accessToken, refresh } を、失敗（refresh 無効）なら null を返す。
export async function refreshTokens(
  refresh: string,
): Promise<{ accessToken: string; refresh: string } | null> {
  const res = await client.api.auth.refresh.$post(
    {},
    { headers: { Cookie: `refresh_token=${refresh}` } },
  );
  if (!res.ok) return null;
  const body = (await res.json()) as { accessToken?: string };
  const newRefresh = extractRefreshCookie(res);
  if (!body.accessToken || !newRefresh) return null;
  return { accessToken: body.accessToken, refresh: newRefresh };
}

// ログアウト：refresh を Cookie ヘッダで送り、API 側（DB）で失効させる。
// ネットワーク失敗等でも Cookie 破棄は進めたいので、ここでは例外を握りつぶす。
export async function revokeRefresh(refresh: string): Promise<void> {
  await client.api.auth.logout
    .$post({}, { headers: { Cookie: `refresh_token=${refresh}` } })
    .catch(() => {});
}
