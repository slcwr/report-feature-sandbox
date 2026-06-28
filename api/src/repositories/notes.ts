import { eq, sql } from "drizzle-orm";
import { db } from "../db/mysql";
import { student_notes, type NewStudentNotes, type StudentNotes } from "../db/schema";

export async function findByStudentId(student_id: number, limit: number, offset: number): Promise<StudentNotes[]> {
  const rows = await
    db.select()
    .from(student_notes)
    .where(eq(student_notes.student_id, student_id))
    .limit(limit).offset(offset)
  return rows;
}

export async function count(student_id: number): Promise<number> {
  const rows = await
    db.select({ totalCount: sql<number>`count(*)` })
    .from(student_notes)
    .where(eq(student_notes.student_id, student_id))
  return Number(rows[0].totalCount);
}

export async function create(input: NewStudentNotes): Promise<number> {
  const [result] = await db.insert(student_notes).values(input);
  return result.insertId;
}
