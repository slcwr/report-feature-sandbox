import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db/mysql";
import {
  refresh_tokens,
  type NewRefresh_token,
  type Refresh_token,
} from "../db/schema";

// ─────────────────────────────────────────────
// データアクセス層（Repository / refresh_tokens）
// 「どんなクエリを投げ、どんな行が返るか」だけを担当する。
// ローテーション・再利用検知などの業務判断は service 層の責務。
// ─────────────────────────────────────────────

export async function create(input: NewRefresh_token): Promise<void> {
  await db.insert(refresh_tokens).values(input);
}

// ハッシュで1件引く（失効済みも含めて返す＝再利用検知のため service 側で判定する）。
export async function findByHash(
  token_hash: string,
): Promise<Refresh_token | undefined> {
  const rows = await db
    .select()
    .from(refresh_tokens)
    .where(eq(refresh_tokens.token_hash, token_hash))
    .limit(1);
  return rows[0];
}

// id 指定で1件失効。
export async function revoke(id: number): Promise<void> {
  await db
    .update(refresh_tokens)
    .set({ revoked_at: new Date() })
    .where(eq(refresh_tokens.id, id));
}

// ハッシュ指定で失効（ログアウト用）。既に失効済みなら何も起きない。
export async function revokeByHash(token_hash: string): Promise<void> {
  await db
    .update(refresh_tokens)
    .set({ revoked_at: new Date() })
    .where(
      and(
        eq(refresh_tokens.token_hash, token_hash),
        isNull(refresh_tokens.revoked_at),
      ),
    );
}

// あるユーザーの有効な全トークンを失効（再利用検知時の一括失効）。
export async function revokeAllForUser(user_id: number): Promise<void> {
  await db
    .update(refresh_tokens)
    .set({ revoked_at: new Date() })
    .where(
      and(
        eq(refresh_tokens.user_id, user_id),
        isNull(refresh_tokens.revoked_at),
      ),
    );
}
