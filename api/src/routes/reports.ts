import { Hono } from "hono";
import { query, CSV } from "../db";

// ─────────────────────────────────────────────
// レポート系ルート（/api/reports/*）
// ─────────────────────────────────────────────

// RPC を効かせるため、必ずメソッドチェーンで定義する。
// （途中で reports.get(...) と分けて書くと型が途切れ、RPC が効かなくなる）
// この reports の型を index.ts 側で typeof して RPC クライアントに渡す。
export const reports = new Hono()
  // ① 学校別の完了率
  .get("/completion-by-school", async (c) => {
    const data = await query(`
      SELECT school_id,
             count(*) AS total_views,
             round(100.0 * sum(CASE WHEN progress=100 THEN 1 ELSE 0 END) / count(*), 1) AS completion_rate
      FROM '${CSV}'
      GROUP BY school_id
      ORDER BY school_id
    `);
    return c.json(data);
  })
  // ② 動画別ランキング
  .get("/video-ranking", async (c) => {
    const data = await query(`
      SELECT video_title,
             count(*) AS views,
             round(avg(progress), 1) AS avg_progress
      FROM '${CSV}'
      GROUP BY video_title
      ORDER BY views DESC
    `);
    return c.json(data);
  })
  // ③ 要注意の生徒（平均進捗が低い順）
  .get("/at-risk-students", async (c) => {
    const data = await query(`
      SELECT student_id, school_id,
             round(avg(progress), 1) AS avg_progress,
             count(*) AS watched
      FROM '${CSV}'
      GROUP BY student_id, school_id
      HAVING avg(progress) < 60
      ORDER BY avg_progress ASC
    `);
    return c.json(data);
  });
