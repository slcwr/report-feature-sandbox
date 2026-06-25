import { eq } from "drizzle-orm";
import { db } from "../db/mysql";
import { student_notes, type StudentNotes } from "../db/schema";

export async function findById(id: number): Promise<StudentNotes | undefined> {
  const rows = await db
    .select()
    .from(student_notes)
    .where(eq(student_notes.student_id, id)) 
  return rows[0];
}

export async function create(input: StudentNotes): Promise<number> {
  const [result] = await db.insert(student_notes).values(input);
  return result.insertId;
}
