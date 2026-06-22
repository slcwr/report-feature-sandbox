import { query, CSV } from "../db";
import type { AtRiskStudentRow, CompletionBySchoolRow, VideoRankingRow } from "../interface/reports";

// ─────────────────────────────────────────────
// データアクセス層（Repository）
// 「どんな SQL を投げ、どんな行が返るか」だけを担当する。
// HTTP のことも、業務ルールのことも知らない。
// ここで定義した行の型が service → route → web(RPC) まで伝わる。
// ─────────────────────────────────────────────

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
