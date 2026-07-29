require('dotenv').config();
const express = require('express');
const todosRouter = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 3000;

// リクエストボディのJSONを解析するミドルウェア
app.use(express.json());

// public/ フォルダの静的ファイル(HTML/CSS/JS)を配信する
app.use(express.static('public'));

// /todos 以下のAPIルートを登録する
app.use('/todos', todosRouter);

app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
