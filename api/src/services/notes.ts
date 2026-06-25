import * as notesRepository from "../repositories/notes";

export function getByStudentId(id: number) {
  return notesRepository.findById(id);
}
