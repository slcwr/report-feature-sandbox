import { eq } from "drizzle-orm";
import { db } from "../db/mysql";
import { users, type NewUser, type User } from "../db/schema";

// ─────────────────────────────────────────────
// データアクセス層（Repository / users）
// 「どんなクエリを投げ、どんな行が返るか」だけを担当する。
// 業務ルール（重複エラーの扱い等）は service 層の責務。
// ─────────────────────────────────────────────

export async function findByEmail(email: string): Promise<User | undefined> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return rows[0];
}

export async function findById(id: number): Promise<User | undefined> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return rows[0];
}

// 作成して、採番された id を返す。
// 注意：TiDB では insertId が飛び番（大きな値）になり得るが、一意性は保証される。
export async function create(input: NewUser): Promise<number> {
  const [result] = await db.insert(users).values(input);
  return result.insertId;
}
