//  モックを作成する理由　
// 　　本番データを壊すリスクがあるため
//     本物のDBに接続すると遅いため

const request = require('supertest');
const express = require('express');

// src/db/pool.js は本物のPostgreSQLに接続するため、テストではモックに差し替える
jest.mock('../../src/db/pool', () => ({
  query: jest.fn(),
}));

const pool = require('../../src/db/pool');
const todosRouter = require('../../src/routes/todos');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/todos', todosRouter);
  return app;
}

describe('todos ルーター', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    pool.query.mockReset();
  });

  describe('GET /todos', () => {
    test('正常系: 一覧を配列で返す', async () => {
      // Arrange
      const rows = [
        { id: 1, title: '買い物', completed: false },
        { id: 2, title: '掃除', completed: true },
      ];
      pool.query.mockResolvedValueOnce({ rows });

      // Act
      const res = await request(app).get('/todos');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(rows);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM todos ORDER BY id');
    });

    test('正常系: completed=true でフィルタが効く', async () => {
      // Arrange
      const rows = [{ id: 2, title: '掃除', completed: true }];
      pool.query.mockResolvedValueOnce({ rows });

      // Act
      const res = await request(app).get('/todos?completed=true');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(rows);
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM todos WHERE completed = $1 ORDER BY id',
        [true]
      );
    });

    test('異常系: DBエラー時は500を返す', async () => {
      // Arrange
      pool.query.mockRejectedValueOnce(new Error('db error'));

      // Act
      const res = await request(app).get('/todos');

      // Assert
      expect(res.status).toBe(500);
    });
  });

  describe('GET /todos/:id', () => {
    test('正常系: 存在するIDの場合は200で返す', async () => {
      // Arrange
      const todo = { id: 1, title: '買い物', completed: false };
      pool.query.mockResolvedValueOnce({ rows: [todo] });

      // Act
      const res = await request(app).get('/todos/1');

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(todo);
    });

    test('異常系: 存在しないIDの場合は404を返す', async () => {
      // Arrange
      pool.query.mockResolvedValueOnce({ rows: [] });

      // Act
      const res = await request(app).get('/todos/999');

      // Assert
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'todo not found' });
    });
  });

  describe('POST /todos', () => {
    test('正常系: titleを指定すると201でTODOが作成される', async () => {
      // Arrange
      const created = { id: 1, title: '掃除', completed: false };
      pool.query.mockResolvedValueOnce({ rows: [created] });

      // Act
      const res = await request(app).post('/todos').send({ title: '掃除' });

      // Assert
      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO todos (title) VALUES ($1) RETURNING *',
        ['掃除']
      );
    });

    test('異常系: titleが未指定の場合は400を返す', async () => {
      // Act
      const res = await request(app).post('/todos').send({});

      // Assert
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'title is required' });
      expect(pool.query).not.toHaveBeenCalled();
    });

    test('エッジケース: titleが空白のみの場合は400を返す', async () => {
      // Act
      const res = await request(app).post('/todos').send({ title: '   ' });

      // Assert
      expect(res.status).toBe(400);
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /todos/:id', () => {
    test('正常系: completedを更新できる', async () => {
      // Arrange
      const updated = { id: 1, title: '運動', completed: true };
      pool.query.mockResolvedValueOnce({ rows: [updated] });

      // Act
      const res = await request(app).patch('/todos/1').send({ completed: true });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
    });

    test('正常系: titleを更新できる', async () => {
      // Arrange
      const updated = { id: 1, title: 'ランニング', completed: false };
      pool.query.mockResolvedValueOnce({ rows: [updated] });

      // Act
      const res = await request(app).patch('/todos/1').send({ title: 'ランニング' });

      // Assert
      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
    });

    test('異常系: 存在しないIDの場合は404を返す', async () => {
      // Arrange
      pool.query.mockResolvedValueOnce({ rows: [] });

      // Act
      const res = await request(app).patch('/todos/999').send({ completed: true });

      // Assert
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'todo not found' });
    });
  });

  describe('DELETE /todos/:id', () => {
    test('正常系: 存在するTODOを削除すると204を返す', async () => {
      // Arrange
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      // Act
      const res = await request(app).delete('/todos/1');

      // Assert
      expect(res.status).toBe(204);
    });

    test('異常系: 存在しないIDの場合は404を返す', async () => {
      // Arrange
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      // Act
      const res = await request(app).delete('/todos/999');

      // Assert
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'todo not found' });
    });
  });
});
