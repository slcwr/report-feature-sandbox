import { redirect } from "react-router";
import { destroySession, getSession } from "~/features/auth/session.server";
import type { Route } from "./+types/logout";

// session を破棄する＝保持している JWT を捨てること。
// JWT はステートレスなので、これがクライアント側の実質的なログアウトになる。
export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}
