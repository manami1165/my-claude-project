## タスクログ

### 02_プロジェクト作成

- ゴール: ブラウザで http://localhost:3000 にアクセスしてTODO画面が表示される
- 分解: ① バックエンド骨格 ② フロントエンド追加 ③ README
- 検証: npm start → ブラウザで画面確認
- 失敗予測: ブラウザで画面が開けなかったので、どうしたらいいか聞いた。
- 気づき: パターンA(まとめて依頼)は全部やってくれてすごいと思った。パターンB(分割して依頼)は、途中で確認しながら進められるので安心感があると思った。

### 03_PostgreSQLとCRUD
- 
ゴール: curl でCRUDが動作する・ブラウザでTODOのDB 永続化が確認できる 
分解: 1 DB・テーブル作成 2 .env作成 → 3 CRUD API実装 → テスト追加 
→ 4 
- 検証:curl で正常系・異常系を確認 / npm test グリーン 
- 失敗予測:(自分が書いたメモを転記) 


① テーブル設計
| カラム名       | 型            | 制約                     |
| ---------- | ------------ | ---------------------- |
| id         | BIGSERIAL    | PRIMARY KEY            |
| title      | VARCHAR(255) | NOT NULL               |
| completed  | BOOLEAN      | NOT NULL DEFAULT FALSE |
| created_at | TIMESTAMP    | NOT NULL               |


② APIエンドポイント
| メソッド   | パス           | 概要            |
| ------ | ------------ | ------------- |
| GET    | `/todos`     | Todo一覧を取得する   |
| POST   | `/todos`     | Todoを新規作成する   |
| PATCH  | `/todos/:id` | 指定したTodoを更新する |
| DELETE | `/todos/:id` | 指定したTodoを削除する |


③ バリデーション要件

「どんなデータなら受け付ける？」を考える。

例えば

titleは必須
titleは255文字以内
completedはtrueかfalse

### 失敗予測
・入力チェック漏れ
・エラー処理漏れ
・SQLの安全性確認
・設計と違う実装になる可能性

### 4-3 動作確認の結果

- 検証環境: PostgreSQL 17(サービス起動済み)、`node src/index.js` でサーバー起動
- POST /todos (正常系: title あり) → 201 ✅
- POST /todos (異常系: title なし) → 400 ✅ (`{"error":"title is required"}`)
- GET /todos (全件取得) → 200・配列で返却 ✅
- psql でDBを直接確認し、永続化されていることを確認 ✅

**気づき(予想外の動作):**
Git Bashからcurlで日本語のtitle(例:「Claude Code を試す」)を送信すると、DBに文字化けした状態で保存されてしまった。原因を切り分けるためPowerShellの`Invoke-RestMethod`でUTF-8エンコーディングを明示して同じリクエストを送ったところ、正常に日本語が保存されることを確認。→ アプリ側(pool.js/todos.js)のバグではなく、**Git Bash環境でcurlに日本語引数を渡す際のエンコーディング起因**と判断。今後日本語データをcurlで検証する際はPowerShellを使うか、UTF-8を明示する必要がある。

### 4-4 テスト修正

- `__tests__/routes/todos.test.js` が旧実装(メモリ配列)向けのままだったため、`jest.mock('../../src/db/pool', ...)` でDB接続をモックする形に書き直した。
- 実行結果: 18件中18件パス(本物のPostgreSQLに接続せず完結)。

05_EC2デプロイとCICD
ゴール:
http://<EC2のIP> にブラウザでアクセスしてTODO画面が表示される状態

分解（やること一覧）:

EC2インスタンスの起動・SSH接続
EC2上の環境構築
アプリの手動デプロイ
手動デプロイの動作確認
CI/CD（GitHub Actions）の設定
CI/CDの動作確認

検証:
→ 各ステップの完了条件を設定する

SSH接続完了 → EC2上でコマンド実行できる
環境構築完了 → 必要な環境・DBが利用できる
手動デプロイ完了 → ブラウザでTODO画面が表示される
CI/CD設定完了 → GitHub Actionsが成功する
自動デプロイ完了 → pushした変更がブラウザに反映される

失敗予測:

SSH接続の権限エラー
Security Groupのポート設定漏れ
DB接続エラー（Peer authentication failedなど）
環境変数の設定漏れ
アプリのポート設定ミス
GitHub ActionsのSecrets設定ミス
GitHub ActionsからEC2へのSSH接続失敗
デプロイ後のアプリ再起動漏れ

### 06_AI生成コードの理解

ゴール: 全チェック項目を自分の言葉で説明できる状態

理解できていない箇所:
- src/index.js が何をしているか
- src/routes/todos.js の各エンドポイントが何をしているか
- src/db/pool.js のコネクションプールがなぜ必要か
- public/index.html がAPIをどう呼んでいるか
- .env がなぜGitにコミットしてはいけないか
- todos テーブルの各カラムの意味
- パラメータ化クエリ($1, $2)がなぜ必要か
- マイグレーションファイルを自分で書けるか
- jest.mockでDBをモックしている理由
- AAAパターンで新しいテストケースを自分で書けるか
- カバレッジが何を意味するか
- ci.yml と deploy.yml が何をしているか
- needs: test がなぜ必要か

分解: 各不明箇所を1つずつClaudeに質問 → 自分の言葉でコメント追記
検証: 再度チェックリストを採点して全項目クリアを確認
失敗予測:「説明して」と頼むとClaudeの文章をコピーしがちになる→自分の言葉で書く意識を持つ