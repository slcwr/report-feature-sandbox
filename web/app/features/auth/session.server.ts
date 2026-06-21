import { createCookieSessionStorage } from "react-router";

type SessionData = { userId: number };

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData>({
    cookie: {
      name: "__session",
      httpOnly: true, // ★JSから読めない（XSS対策）
      sameSite: "lax",
      path: "/",
      secrets: [process.env.SESSION_SECRET ?? "dev-secret-change-me"],
      secure: process.env.NODE_ENV === "production", // 本番はHTTPSのみ
      maxAge: 60 * 60 * 24, // 1日
    },
  });
