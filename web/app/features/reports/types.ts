// ─────────────────────────────────────────────
// レポート機能の型（行データの形）
// components はこの型だけを参照し、api からの取得結果と画面表示を結ぶ。
// 正本は api 側（api/src/interface/reports.ts）。ここはそれを web 用にミラーしている。
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
