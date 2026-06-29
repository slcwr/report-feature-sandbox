# 認証シーケンス

アーキテクチャは **ブラウザ ↔ Web(React Router BFF) ↔ API(Hono) ↔ DB(MySQL)** の4層構成。
アクセストークン(JWT 15分)とリフレッシュトークン(不透明値 30日)を BFF の `__session`(httpOnly) に保持する。

## ① ログイン / 新規登録

```mermaid
sequenceDiagram
    autonumber
    actor U as ブラウザ
    participant W as Web (React Router BFF)
    participant A as API (Hono)
    participant DB as DB (MySQL)

    U->>W: POST /login (email, password)
    Note over W: routes/login.tsx action
    W->>A: POST /api/auth/login (json)
    A->>DB: findByEmail(email)
    DB-->>A: user (or なし)
    Note over A: bcrypt.compare で照合<br/>失敗は一律 401（情報漏れ防止）
    A->>A: issueToken() … JWT(15分)
    A->>A: issueRefreshToken() … 乱数32byte
    A->>DB: refresh_tokens.create(token_hash, expires_at)
    A-->>W: 200 { user, accessToken }<br/>Set-Cookie: refresh_token(httpOnly)
    Note over W: accessToken=body から<br/>refresh=Set-Cookie から抽出
    W->>W: session.set(accessToken, refresh)
    W-->>U: 302 /reports<br/>Set-Cookie: __session(httpOnly)
```

## ② 認証付きデータ取得（自動リフレッシュ込み）

```mermaid
sequenceDiagram
    autonumber
    actor U as ブラウザ
    participant W as Web (BFF / withAuth)
    participant A as API (Hono)
    participant DB as DB (MySQL)

    U->>W: GET /reports (Cookie: __session)
    Note over W: withAuth() が session から<br/>accessToken / refresh を取得<br/>無ければ /login へ redirect

    W->>A: GET /api/reports/* (Authorization: Bearer access)
    Note over A: authMiddleware が JWT 検証

    alt access が有効
        A-->>W: 200 データ
        W-->>U: 200 画面表示
    else access 期限切れ (401)
        A-->>W: 401
        Note over W: api 関数が UnauthorizedError を throw
        W->>W: refreshOnce(refresh) … single-flight
        W->>A: POST /api/auth/refresh (Cookie: refresh_token)
        A->>DB: findByHash(hash(refresh))

        alt refresh が有効
            Note over A: ローテーション
            A->>DB: revoke(古いトークン)
            A->>DB: create(新トークン)
            A-->>W: 200 { accessToken }<br/>Set-Cookie: 新 refresh_token
            W->>W: session 更新 → setCookie 生成
            W->>A: GET /api/reports/* (新 Bearer) ※1回だけ再試行
            A-->>W: 200 データ
            W-->>U: 200 画面表示<br/>Set-Cookie: __session(更新)
        else refresh も無効 / 期限切れ / 再利用検知
            Note over A,DB: 失効済み再提示なら<br/>revokeAllForUser（盗難対策）
            A-->>W: 401
            W-->>U: 302 /login<br/>Set-Cookie: __session 破棄
        end
    end
```

## ③ ログアウト

```mermaid
sequenceDiagram
    autonumber
    actor U as ブラウザ
    participant W as Web (BFF)
    participant A as API (Hono)
    participant DB as DB (MySQL)

    U->>W: POST /logout
    Note over W: routes/logout.tsx action
    W->>A: POST /api/auth/logout (Cookie: refresh_token)
    A->>DB: revokeByHash(hash(refresh))<br/>※DB側で失効
    A-->>W: 200 { ok: true }<br/>deleteCookie(refresh_token)
    Note over W: ネットワーク失敗時も<br/>session 破棄は続行
    W-->>U: 302 /login<br/>Set-Cookie: __session 破棄
```

## 設計のポイント

- **二重Cookie構成**: API は `refresh_token` Cookie を発行するが、BFF はそれをブラウザに渡さず値を抜き出して自前の `__session`(httpOnly) に保管する。ブラウザ JS からトークンが一切読めない（XSS耐性）。
- **トークンローテーション + 再利用検知**: `api/src/services/auth.ts` の `rotateRefreshToken` — 失効済みリフレッシュトークンが再提示されたら盗難とみなし、そのユーザーの全トークンを失効。
- **single-flight**: `web/app/features/auth/with-auth.server.ts` — 1ナビゲーションで複数 loader が同時に 401 → 同時 refresh すると、ローテーションで2本目以降が再利用検知に誤判定され強制ログアウトになるのを防ぐ。
