import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// ─────────────────────────────────────────────
// インフラ層：機能用 RDB（MySQL / 本番 TiDB）への接続
// レポート系の DuckDB(./index.ts) とは別物として併存させる。
//   - DuckDB … 集計・読み取り専用（watch_logs.csv）
//   - MySQL  … 機能用のトランザクション系（users 等）
//
// 接続先は DATABASE_URL で切り替える：
//   ローカル … mysql://app:app@db:3306/app（compose の db サービス）
//   本番     … TiDB の接続文字列に差し替えるだけ（コードは不変）
// ─────────────────────────────────────────────
const url =
  process.env.DATABASE_URL ?? "mysql://app:app@localhost:3306/app";

// プールで持つ（Lambda 等でも使い回せるよう、毎回 connect しない）。
const pool = mysql.createPool(url);

// schema を渡しておくと db.query.users... のリレーショナルAPIや型補完が効く。
export const db = drizzle(pool, { schema, mode: "default" });
