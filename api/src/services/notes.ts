import * as notesRepository from "../repositories/notes";
import type { NewStudentNotes } from "../db/schema";

export async function getByStudentId(student_id: number,page: number, limit: number) {
  const offset = (page - 1) * limit
  const items = await notesRepository.findByStudentId(student_id,limit,offset);
  const total = await notesRepository.count(student_id);
  return {
    items,
    pagination: {
        page, limit ,total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
    }
  }
}

export function create(input: NewStudentNotes) {
  return notesRepository.create(input);
}
