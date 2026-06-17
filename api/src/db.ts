import { DuckDBInstance } from "@duckdb/node-api";

// ─────────────────────────────────────────────
// DB（DuckDB）まわり
// data/watch_logs.csv を DuckDB で集計する。
// ─────────────────────────────────────────────

// データ置き場（docker では DATA_DIR を渡す。未指定ならローカルの ../data）
const DATA_DIR = process.env.DATA_DIR ?? "../data";
export const CSV = `${DATA_DIR}/watch_logs.csv`;

// DuckDB はクエリ結果の数値を BigInt で返すことがあるので、
// JSON にする前に普通の数値・文字列へ変換するヘルパー
function toPlain(rows: unknown[][], columns: string[]) {
  return rows.map((row) =>
    Object.fromEntries(
      row.map((v, i) => [columns[i], typeof v === "bigint" ? Number(v) : v])
    )
  );
}

// DuckDB に接続して SQL を実行し、扱いやすい形（オブジェクトの配列）で返す。
// 呼び出し側で query<MyRow>(sql) と行の型を指定すると、戻り値もその型になる。
export async function query<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  const instance = await DuckDBInstance.create(":memory:");
  const conn = await instance.connect();
  const reader = await conn.runAndReadAll(sql);
  const rows = reader.getRows();
  const columns = reader.columnNames();
  return toPlain(rows, columns) as T[];
}
