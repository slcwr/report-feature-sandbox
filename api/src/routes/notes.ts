import { Hono } from "hono";
import * as notesService from "../services/notes";
import { authMiddleware } from "../middlewares/auth";

export const notes = new Hono()
  // 新規登録：認証必須。author_id は body ではなく JWT（ログインユーザー）から取る。
  .post("/notes", authMiddleware, async (c) => {
    const authorId = c.get("userId");
    const { student_id, body, status } = await c.req.json<{
      student_id: number;
      body: string;
      status: "open" | "in_progress" | "done";
    }>();
    const id = await notesService.create({
      student_id,
      author_id: authorId,
      body,
      status,
    });
    return c.json({ id }, 201);
  })

  .get("/notes/:id", async (c) => {
    const id = Number(c.req.param("id"));
    return c.json(await notesService.getByStudentId(id));
  });
