const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// TODO一覧を取得する(クエリパラメータ ?completed=true|false で絞り込み可能)
router.get('/', async (req, res) => {
  try {
    const { completed } = req.query;
    let result;

    if (completed === 'true' || completed === 'false') {
      result = await pool.query(
        'SELECT * FROM todos WHERE completed = $1 ORDER BY id',
        [completed === 'true']
      );
    } else {
      result = await pool.query('SELECT * FROM todos ORDER BY id');
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// IDを指定してTODOを1件取得する
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'todo not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// TODOを新規追加する
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }

    const result = await pool.query(
      'INSERT INTO todos (title) VALUES ($1) RETURNING *',
      [title.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// TODOを更新する(完了状態の切り替え・タイトル変更)
router.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, completed } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ error: 'title must not be empty' });
    }

    const result = await pool.query(
      `UPDATE todos
       SET title = COALESCE($1, title),
           completed = COALESCE($2, completed)
       WHERE id = $3
       RETURNING *`,
      [title !== undefined ? title.trim() : null, completed !== undefined ? completed : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'todo not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// TODOを削除する
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await pool.query('DELETE FROM todos WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'todo not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  }
});

module.exports = router;
