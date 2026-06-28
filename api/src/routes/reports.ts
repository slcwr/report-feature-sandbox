import { Hono } from "hono";
import * as reportsService from "../services/reports";
import { authMiddleware } from "../middlewares/auth";

// ─────────────────────────────────────────────
// プレゼンテーション層（Route / Controller）
// 「HTTP のことだけ」を担当する：パスの定義、入力の受け取り、JSON で返す。
// 実際の処理は service に委譲し、SQL はここには書かない。
//
// ※ RPC を効かせるため、必ずメソッドチェーンで定義する。
//   （途中で reports.get(...) と分けて書くと型が途切れ、RPC が効かなくなる）
//   この reports の型を index.ts 側で typeof して RPC クライアントに渡す。
// ─────────────────────────────────────────────
export const reports = new Hono()
  // 認証必須：以降のレポート系は Bearer トークンが検証できた時だけ通す。
  .use("/*", authMiddleware)
  // ① 学校別の完了率
  .get("/completion-by-school", authMiddleware,async (c) => {
    return c.json(await reportsService.getCompletionBySchool());
  })
  // ② 動画別ランキング
  .get("/video-ranking", authMiddleware,async (c) => {
    return c.json(await reportsService.getVideoRanking());
  })
  // ③ 要注意の生徒（平均進捗が低い順）
  .get("/at-risk-students", authMiddleware,async (c) => {
    return c.json(await reportsService.getAtRiskStudents());
  });
