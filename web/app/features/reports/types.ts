// ─────────────────────────────────────────────
// データの型（reports 機能） ― features 内の「葉」
// api が返す行の形をここに集約する。何も import しない（誰にも依存しない）。
// これにより依存は常に "… → types" の一方向になり、循環を作らない。
//   api.ts        … 戻り値の型注釈にこの型を使う（api → types）
//   components/*  … props の型にこの型を使う（ui → types）
// ─────────────────────────────────────────────

// ① 学校別の完了率
export type CompletionBySchoolRow = {
  school_id: string;
  total_views: number;
  completion_rate: number;
};

// ② 動画別ランキング
export type VideoRankingRow = {
  video_title: string;
  views: number;
  avg_progress: number;
};

// ③ 要注意の生徒（平均進捗が低い順）
export type AtRiskStudentRow = {
  student_id: string;
  school_id: string;
  avg_progress: number;
  watched: number;
};
