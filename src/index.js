//接続情報を.envファイルから読み込む
require('dotenv').config();
const express = require('express');
//todosファイルを読み込む
const todosRouter = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3000;

// リクエストボディのJSONを解析するミドルウェア
app.use(express.json());

// public/ フォルダの静的ファイル(HTML/CSS/JS)を配信する
app.use(express.static('public'));

// /todos 以下のAPIルートを登録する
app.use('/todos', todosRouter);

//サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

