# アーキテクチャドキュメント

## 1. システム概要

シンプルなTODO管理アプリ。ブラウザからTODOの追加・一覧表示・完了状態の切り替え・削除ができる。
バックエンドはNode.js(Express)、データはPostgreSQLに永続化される。EC2上にデプロイされ、GitHub ActionsによるCI/CDで自動テスト・自動デプロイが行われる。

## 2. 技術スタック一覧

| 種別 | 技術 | 理由 |
|---|---|---|
| 言語/ランタイム | Node.js | サーバーサイドJavaScriptの標準的な実行環境 |
| フレームワーク | Express | 軽量でルーティング・ミドルウェアの扱いがシンプル |
| DB | PostgreSQL | 信頼性の高いオープンソースのリレーショナルDB |
| DBクライアント | pg (node-postgres) | Node.jsからPostgreSQLへ接続するための標準的なライブラリ |
| 環境変数管理 | dotenv | `.env`ファイルから設定を読み込み、環境ごとに切り替え可能にする |
| テスト | Jest | Node.js向けの定番テストフレームワーク、モックやカバレッジ計測が標準搭載 |
| APIテスト | supertest | HTTPリクエストを実際に送ってExpressのルートをテストできる |
| フロントエンド | 素のHTML/CSS/JavaScript | 学習用の小規模アプリのため、フレームワークを使わずシンプルに実装 |
| プロセス管理(本番) | pm2 | Node.jsアプリをバックグラウンドで永続稼働させ、自動再起動もできる |
| リバースプロキシ(本番) | Nginx | 80番ポートで受けたリクエストをアプリのポート(3000)へ転送する |
| CI/CD | GitHub Actions | pushをトリガーにテスト・デプロイを自動化 |
| ホスティング | AWS EC2 | 仮想サーバーを借りて本番環境として利用 |

## 3. ディレクトリ構成と各ファイルの役割

```
my-claude-project/
├── src/
│   ├── index.js          # アプリのエントリポイント。Express初期化、ミドルウェア登録、サーバー起動
│   ├── routes/
│   │   └── todos.js      # /todos 以下のAPIエンドポイント(CRUD)を定義
│   └── db/
│       └── pool.js       # PostgreSQLへのコネクションプールを作成・export
├── public/
│   ├── index.html        # 画面のエントリポイント(フォーム・リストのHTML)
│   ├── app.js             # フロントエンドのロジック(fetchでAPIを呼び出し、DOM描画)
│   └── style.css          # 画面のスタイル
├── db/
│   └── migrations/
│       └── 001_create_todos.sql  # todosテーブルの作成・updated_at自動更新トリガー
├── __tests__/
│   ├── routes/todos.test.js      # バックエンドAPIのテスト(DBはモック)
│   └── frontend/todo.test.js     # フロントエンドのテスト(jsdom環境)
├── .github/workflows/
│   ├── ci.yml             # push/PR時にテスト・カバレッジを自動実行
│   └── deploy.yml         # main pushでCI成功後にEC2へ自動デプロイ
├── .claude/commands/
│   ├── deploy-check.md    # デプロイ前チェック用スラッシュコマンド
│   └── (このSTEPでupdate-docs.mdを追加予定)
├── docs/
│   ├── architecture.md    # このドキュメント
│   └── tasklog.md         # 各章のタスク設計・振り返りの記録
├── jest.config.js         # テスト環境・カバレッジ閾値の設定
├── package.json           # 依存関係とnpmスクリプトの定義
└── .env                   # DB接続情報など(Gitには含めない)
```

## 4. データフロー図

```
[ブラウザ]
  │  ユーザー操作(フォーム送信・チェックボックス・削除ボタン)
  ▼
[public/app.js] --fetch()--> [src/index.js (Express)]
                                   │
                                   ▼
                        [src/routes/todos.js]
                                   │  パラメータ化クエリ($1, $2)
                                   ▼
                         [src/db/pool.js] --SQL--> [PostgreSQL (todosテーブル)]
                                   │
                                   ▼(結果をJSONで返却)
[public/app.js] <--JSON応答-- [src/routes/todos.js]
  │
  ▼
[画面のDOM更新(renderTodos)]
```

## 5. APIエンドポイント一覧

| メソッド | パス | リクエスト | レスポンス |
|---|---|---|---|
| GET | `/todos` | クエリ `?completed=true\|false` (任意) | 200: TODO配列 |
| GET | `/todos/:id` | - | 200: TODO1件 / 404: 存在しない場合 |
| POST | `/todos` | `{ "title": string }` | 201: 作成されたTODO / 400: titleが空 |
| PATCH | `/todos/:id` | `{ "title"?: string, "completed"?: boolean }` | 200: 更新後のTODO / 400・404 |
| DELETE | `/todos/:id` | - | 204: 削除成功 / 404: 存在しない場合 |

## 6. データベーススキーマ

`todos` テーブル(`db/migrations/001_create_todos.sql`):

| カラム | 型 | 説明 |
|---|---|---|
| `id` | BIGSERIAL PRIMARY KEY | 自動採番される一意のID |
| `title` | TEXT NOT NULL | TODOのタイトル(必須) |
| `completed` | BOOLEAN NOT NULL DEFAULT false | 完了状態(デフォルトは未完了) |
| `created_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | 更新日時(トリガーで自動更新) |

`todos_updated_at` トリガーが、UPDATE実行時に`updated_at`を自動的に現在時刻へ更新する。

## 7. 環境変数一覧

| 変数名 | 説明 |
|---|---|
| `DB_HOST` | PostgreSQLの接続先ホスト |
| `DB_PORT` | PostgreSQLの接続ポート(通常5432) |
| `DB_NAME` | データベース名 |
| `DB_USER` | DB接続ユーザー名 |
| `DB_PASSWORD` | DB接続パスワード |
| `PORT` | Expressアプリが待ち受けるポート(通常3000) |

`.env`ファイルに設定し、`.gitignore`で除外することでGitHubに公開されないようにしている。

## 8. ローカル開発の起動手順

```bash
# 1. 依存関係のインストール
npm install

# 2. .env を作成し、DB接続情報を記入する

# 3. PostgreSQLにマイグレーションを適用
psql -h localhost -U <DB_USER> -d <DB_NAME> -f db/migrations/001_create_todos.sql

# 4. サーバーを起動
npm start

# 5. ブラウザで http://localhost:3000 を開く
```

テストの実行:
```bash
npm test              # 全テスト実行
npm run test:coverage # カバレッジ計測付きで実行
```
