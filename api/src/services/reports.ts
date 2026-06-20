import * as reportsRepository from "../repositories/reports";

// ─────────────────────────────────────────────
// ビジネスロジック層（Service）
// 「業務として何をするか」を担当する。
// 今は repository をそのまま呼ぶだけだが、将来この層に
//   - 認可（例：自分の学校のデータだけに絞る）
//   - 複数 repository の結果を組み合わせる集計
//   - しきい値などの業務ルール
// を集約していく。route と repository を疎結合に保つための層。
// ─────────────────────────────────────────────

export function getCompletionBySchool() {
  return reportsRepository.findCompletionBySchool();
}

export function getVideoRanking() {
  return reportsRepository.findVideoRanking();
}

export function getAtRiskStudents() {
  return reportsRepository.findAtRiskStudents();
}
