// API が返す 1 件のノート（student_notes の 1 行）。
// 値は drizzle のスキーマ由来：student_id は number、body は NULL 許容。
export type StudentNote = {
  student_id: number;
  body: string | null;
  status: "open" | "in_progress" | "done";
};

// ノート一覧 API のレスポンス（ページネーション付き）。
// service の getByStudentId が返す形に対応する。
export type StudentNotesResponse = {
  items: StudentNote[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};
