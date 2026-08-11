/**
 * @jest-environment jsdom
 */

// public/app.js はブラウザで直接読み込まれるスクリプトなので、
// テストごとにDOMとfetchモックを用意してから読み込み直す(トップレベルで
// fetchTodos()が実行されるため、jest.resetModules()で毎回まっさらにする)

// fetchのPromiseチェーンが解決するのを待つためのヘルパー
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('TODOアプリ フロントエンド (public/app.js)', () => {
  beforeEach(() => {
    // Arrange: 画面のDOMを初期状態に戻す
    document.body.innerHTML = `
      <form id="todo-form">
        <input type="text" id="todo-title">
        <button type="submit">追加</button>
      </form>
      <ul id="todo-list"></ul>
    `;

    // fetchをグローバルモックに差し替える
    global.fetch = jest.fn();

    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('TODOリストが正しくレンダリングされる', async () => {
    // Arrange　準備　テスト用のダミーデータを用意
    const todos = [
      { id: 1, title: '買い物', completed: false },
      { id: 2, title: '掃除', completed: true },
    ];
    global.fetch.mockResolvedValue({ json: () => Promise.resolve(todos) });

    // Act　実行　app.jsを読み込んで画面に描画
    require('../../public/app.js');
    await flushPromises();

    // Assert　確認　期待どおりかをチェック
    const items = document.querySelectorAll('#todo-list li');
    expect(items).toHaveLength(2);
    expect(items[0].querySelector('span').textContent).toBe('買い物');
    expect(items[0].classList.contains('completed')).toBe(false);
    expect(items[1].querySelector('span').textContent).toBe('掃除');
    expect(items[1].classList.contains('completed')).toBe(true);
  });

  test('追加フォームの送信でfetch POSTが呼ばれる', async () => {
    // Arrange
    global.fetch.mockResolvedValue({ json: () => Promise.resolve([]) });
    require('../../public/app.js');
    await flushPromises();
    global.fetch.mockClear();
    global.fetch.mockResolvedValue({ json: () => Promise.resolve([]) });

    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-title');
    input.value = '新しいタスク';

    // Act
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      '/todos',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: '新しいタスク' }),
      })
    );
  });

  test('エッジケース: 空白のみのタイトルで送信してもPOSTは呼ばれない', async () => {
    // Arrange
    global.fetch.mockResolvedValue({ json: () => Promise.resolve([]) });
    require('../../public/app.js');
    await flushPromises();
    global.fetch.mockClear();

    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-title');
    input.value = '   ';

    // Act
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    // Assert
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('完了チェックボックスのクリックでfetch PATCHが呼ばれる', async () => {
    // Arrange
    const todos = [{ id: 1, title: '買い物', completed: false }];
    global.fetch.mockResolvedValue({ json: () => Promise.resolve(todos) });
    require('../../public/app.js');
    await flushPromises();
    global.fetch.mockClear();
    global.fetch.mockResolvedValue({ json: () => Promise.resolve(todos) });

    const checkbox = document.querySelector('#todo-list li input[type="checkbox"]');
    checkbox.checked = true;

    // Act
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    await flushPromises();

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      '/todos/1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ completed: true }),
      })
    );
  });

  test('削除ボタンのクリックでfetch DELETEが呼ばれる', async () => {
    // Arrange
    const todos = [{ id: 1, title: '買い物', completed: false }];
    global.fetch.mockResolvedValue({ json: () => Promise.resolve(todos) });
    require('../../public/app.js');
    await flushPromises();
    global.fetch.mockClear();
    global.fetch.mockResolvedValue({ json: () => Promise.resolve(todos) });

    const deleteButton = document.querySelector('#todo-list li button');

    // Act
    deleteButton.dispatchEvent(new Event('click', { bubbles: true }));
    await flushPromises();

    // Assert
    expect(global.fetch).toHaveBeenCalledWith(
      '/todos/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
