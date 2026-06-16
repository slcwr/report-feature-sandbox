import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { DuckDBInstance } from "@duckdb/node-api";

// ─────────────────────────────────────────────
// レポートAPI（Hono + DuckDB）
// data/watch_logs.csv を DuckDB で集計し、JSON で返す。
// 本番では DuckDB の代わりに Athena を叩く想定だが、
// 「集計してJSONを返す」という形は同じ。
// ─────────────────────────────────────────────

const DATA_DIR = process.env.DATA_DIR ?? "../data";
const CSV = `${DATA_DIR}/watch_logs.csv`;

// DuckDB はクエリ結果の数値を BigInt で返すことがあるので、
// JSON にする前に普通の数値・文字列へ変換するヘルパー
function toPlain(rows: unknown[][], columns: string[]) {
  return rows.map((row) =>
    Object.fromEntries(
      row.map((v, i) => [columns[i], typeof v === "bigint" ? Number(v) : v])
    )
  );
}

// DuckDB に接続して SQL を実行し、扱いやすい形で返す
async function query(sql: string) {
  const instance = await DuckDBInstance.create(":memory:");
  const conn = await instance.connect();
  const reader = await conn.runAndReadAll(sql);
  const rows = reader.getRows();
  const columns = reader.columnNames();
  return toPlain(rows, columns);
}

const app = new Hono();
app.use("/*", cors({ origin: ["http://localhost:3000"] }));

// 動作確認
app.get("/health", (c) => c.json({ ok: true }));

// ① 学校別の完了率
app.get("/api/reports/completion-by-school", async (c) => {
  const data = await query(`
    SELECT school_id,
           count(*) AS total_views,
           round(100.0 * sum(CASE WHEN progress=100 THEN 1 ELSE 0 END) / count(*), 1) AS completion_rate
    FROM '${CSV}'
    GROUP BY school_id
    ORDER BY school_id
  `);
  return c.json(data);
});

// ② 動画別ランキング
app.get("/api/reports/video-ranking", async (c) => {
  const data = await query(`
    SELECT video_title,
           count(*) AS views,
           round(avg(progress), 1) AS avg_progress
    FROM '${CSV}'
    GROUP BY video_title
    ORDER BY views DESC
  `);
  return c.json(data);
});

// ③ 要注意の生徒（平均進捗が低い順）
app.get("/api/reports/at-risk-students", async (c) => {
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

serve({ fetch: app.fetch, port: 8787, hostname: "0.0.0.0" }, (info) => {
  console.log(`Report API listening on http://localhost:${info.port}`);
});
