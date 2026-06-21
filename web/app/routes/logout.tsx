import { redirect } from "react-router";
import { destroySession, getSession } from "~/features/auth/session.server";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}
