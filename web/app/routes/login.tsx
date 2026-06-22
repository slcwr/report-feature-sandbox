import { redirect } from "react-router";
import { login, register } from "~/features/auth/api";
import { LoginForm } from "~/features/auth/components/LoginForm";
import { commitSession, getSession } from "~/features/auth/session.server";
import type { LoginActionResult } from "~/features/auth/types";
import type { Route } from "./+types/login";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("token")) return redirect("/reports");
  return null;
}

export async function action({ request }: Route.ActionArgs): Promise<LoginActionResult | Response> {
  const form = await request.formData();
  const email = String(form.get("email"));
  const password = String(form.get("password"));

  const intent = String(form.get("intent"));
  const result =
    intent === "register" ? await register(email, password) : await login(email, password);

  if (!result) {
    return {
      error:
        intent === "register"
          ? "登録できませんでした（既に登録済みかもしれません）"
          : "メールまたはパスワードが違います",
    };
  }

  // API が発行した JWT を session に保存し、以降の API 呼び出しで Bearer として使う。
  const session = await getSession(request.headers.get("Cookie"));
  session.set("token", result.token);
  return redirect("/reports", {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

// 画面：action がエラーを返した時だけ actionData が入る（成功時はリダイレクト）。
// 表示は features の LoginForm に委譲し、ここは受け渡しだけ（routes 層は薄く保つ）。
export default function Login({ actionData }: Route.ComponentProps) {
  return <LoginForm actionResult={actionData ?? undefined} />;
}
