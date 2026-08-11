//fetchでサーバーにリクエストを送る。省略されている場合、GET
// TODO一覧をサーバーから取得して画面に表示する

//GETメソッド
async function fetchTodos() {
  const res = await fetch('/todos');
  const todos = await res.json();
  renderTodos(todos);
}

// 取得したTODO一覧をリストとして描画する
function renderTodos(todos) {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';

  todos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = todo.completed ? 'completed' : '';

    // 完了/未完了を切り替えるチェックボックス
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id, checkbox.checked));

    // TODOのタイトル表示
    const span = document.createElement('span');
    span.textContent = todo.title;

    // 削除ボタン
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteButton);
    list.appendChild(li);
  });
}

// 新しいTODOを追加する
async function addTodo(title) {
  await fetch('/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  fetchTodos();
}

// TODOの完了状態を切り替える
async function toggleTodo(id, completed) {
  await fetch(`/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  fetchTodos();
}

// TODOを削除する
async function deleteTodo(id) {
  await fetch(`/todos/${id}`, { method: 'DELETE' });
  fetchTodos();
}

// フォーム送信時に新しいTODOを追加する
document.getElementById('todo-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('todo-title');
  const title = input.value.trim();
  if (!title) return;

  addTodo(title);
  input.value = '';
});

// 初回表示時にTODO一覧を読み込む
fetchTodos();
