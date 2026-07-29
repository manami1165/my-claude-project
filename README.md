# my-claude-project

シンプルなTODOアプリです。Node.js + Express のバックエンドと、HTML/CSS/JavaScriptのフロントエンドで構成されています。

## 起動方法

```
npm install
npm start
```

起動後、ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

ポート番号を変更したい場合は `PORT` 環境変数を指定してください。

```
PORT=3002 npm start
```

## APIエンドポイント一覧

| メソッド | パス       | 説明                           |
|----------|------------|--------------------------------|
| GET      | /todos     | TODO一覧を取得                 |
| POST     | /todos     | TODOを新規追加                 |
| PATCH    | /todos/:id | TODOの完了状態・タイトルを更新 |
| DELETE   | /todos/:id | TODOを削除                     |

## ディレクトリ構成

```
my-claude-project/
├── package.json
├── README.md
├── src/
│   ├── index.js         # Expressサーバーのエントリポイント
│   └── routes/
│       └── todos.js     # TODOのAPIルート(GET/POST/PATCH/DELETE)
└── public/
    ├── index.html        # 画面のHTML
    ├── style.css         # 画面のスタイル
    └── app.js            # fetch APIでバックエンドと通信する処理
```
