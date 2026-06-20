import { query, CSV } from "../db";

// ─────────────────────────────────────────────
// データアクセス層（Repository）
// 「どんな SQL を投げ、どんな行が返るか」だけを担当する。
// HTTP のことも、業務ルールのことも知らない。
// ここで定義した行の型が service → route → web(RPC) まで伝わる。
// ─────────────────────────────────────────────

// ① 学校別の完了率
export type CompletionBySchoolRow = {
  school_id: string;
  total_views: number;
  completion_rate: number;
};

export function findCompletionBySchool() {
  return query<CompletionBySchoolRow>(`
    SELECT school_id,
           count(*) AS total_views,
           round(100.0 * sum(CASE WHEN progress=100 THEN 1 ELSE 0 END) / count(*), 1) AS completion_rate
    FROM '${CSV}'
    GROUP BY school_id
    ORDER BY school_id
  `);
}

// ② 動画別ランキング
export type VideoRankingRow = {
  video_title: string;
  views: number;
  avg_progress: number;
};

export function findVideoRanking() {
  return query<VideoRankingRow>(`
    SELECT video_title,
           count(*) AS views,
           round(avg(progress), 1) AS avg_progress
    FROM '${CSV}'
    GROUP BY video_title
    ORDER BY views DESC
  `);
}

// ③ 要注意の生徒（平均進捗が低い順）
export type AtRiskStudentRow = {
  student_id: string;
  school_id: string;
  avg_progress: number;
  watched: number;
};

export function findAtRiskStudents() {
  return query<AtRiskStudentRow>(`
    SELECT student_id, school_id,
           round(avg(progress), 1) AS avg_progress,
           count(*) AS watched
    FROM '${CSV}'
    GROUP BY student_id, school_id
    HAVING avg(progress) < 60
    ORDER BY avg_progress ASC
  `);
}
