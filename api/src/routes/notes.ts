import { Hono } from "hono";
import * as notesService from "../services/notes";

export const notes = new Hono()
  // 新規登録
  // .post("/notes", async (c) => {
  // })

  .get("/notes/:id", async (c) => {
    const id = Number(c.req.param("id"));
    return c.json(await notesService.getByStudentId(id));
  });
