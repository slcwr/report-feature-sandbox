import * as notesRepository from "../repositories/notes";
import type { NewStudentNotes } from "../db/schema";

export function getByStudentId(id: number) {
  return notesRepository.findByStudentId(id);
}

export function create(input: NewStudentNotes) {
  return notesRepository.create(input);
}
