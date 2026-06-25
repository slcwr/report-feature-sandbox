// API が返す 1 件のノート（student_notes の 1 行）。
// 値は drizzle のスキーマ由来：student_id は number、body は NULL 許容。
export type StudentNotesRow = {
  student_id: number;
  body: string | null;
  status: "open" | "in_progress" | "done";
};