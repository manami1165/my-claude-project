const { Pool } = require('pg');

// 環境変数からPostgreSQLへの接続情報を読み込み、コネクションプールを作成する
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
