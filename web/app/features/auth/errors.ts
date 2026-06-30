// API 呼び出しが 401（アクセストークン期限切れ等）を返したことを表すエラー。
// feature の api 関数がこれを throw し、with-auth.server の withAuth が
// 捕捉して /refresh → リトライを行う。
// ※ .server を付けないのは、feature/api（非 .server）からも import するため。
export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}
