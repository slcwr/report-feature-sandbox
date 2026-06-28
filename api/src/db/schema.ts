import { mysqlTable, bigint, varchar, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

// ─────────────────────────────────────────────
// DB スキーマ（Drizzle / dialect: mysql）
// ローカルは MySQL8、本番は TiDB を想定。MySQL 互換なので定義は共通。
//
// TiDB を見据えた設計メモ：
//   - id は AUTO_INCREMENT だが「一意」だけを当てにする（連番・順序は期待しない）。
//     → 「最新」は created_at で並べる。並び順を id に依存させない。
//   - 外部キーは今回 users 単独なので無し。将来テーブルを足す時も、
//     整合性は「トランザクション＋アプリ側チェック」で担保する方針。
// ─────────────────────────────────────────────
export const users = mysqlTable("users", {
  // 一意な識別子。連番である保証はしない（TiDB では飛ぶ）。
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  // ログインID。UNIQUE 制約は MySQL / TiDB どちらでも効くのでDB側で守る。
  email: varchar("email", { length: 255 }).notNull().unique(),
  // bcrypt のハッシュ（生パスワードは保存しない）。bcrypt は60文字だが余裕を持たせる。
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  // 並び順・「最新」判定はこちらを使う（id ではなく）。
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const student_notes = mysqlTable( "student_notes" , {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  student_id: bigint("student_id", { mode: "number" }).notNull(),
  author_id: bigint("author_id", { mode: "number" }).notNull(),
  body: varchar("body", { length: 1000 }),
  status: mysqlEnum("status", ["open","in_progress","done"]).notNull(), 
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
}) 

export const refresh_tokens = mysqlTable("refresh_tokens", {
  id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
  user_id: bigint("user_id", { mode: "number" }).notNull(),
  // SHA-256(生トークン) を hex で。生トークンは保存しない。
  token_hash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expires_at: timestamp("expires_at").notNull(),
  // null = 有効 / 値あり = 失効済み（行は消さずに残す＝再利用検知のため）
  revoked_at: timestamp("revoked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// テーブル定義から行の型を導出（select 用 / insert 用）。
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type StudentNotes = typeof student_notes.$inferSelect;
export type NewStudentNotes = typeof student_notes.$inferInsert;
export type Refresh_token = typeof refresh_tokens.$inferSelect;
export type NewRefresh_token = typeof refresh_tokens.$inferInsert;
