import { createCookieSessionStorage } from "react-router";

// API が発行した JWT をそのまま保持し、API 呼び出し時に Bearer で添える。
type SessionData = { token: string };

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
