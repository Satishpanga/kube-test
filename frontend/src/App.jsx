import { useEffect, useMemo, useState } from 'react';
import TodoForm from './components/TodoForm.jsx';
import TodoItem from './components/TodoItem.jsx';
import { listTodos, createTodo, updateTodo, deleteTodo } from './api.js';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setTodos(await listTodos());
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function addTodo(title) {
    const optimistic = { id: 'tmp-' + Date.now(), title, done: false, createdAt: Date.now() };
    setTodos(prev => [optimistic, ...prev]);
    try {
      const created = await createTodo(title);
      setTodos(prev => prev.map(t => (t.id === optimistic.id ? created : t)));
    } catch (e) {
      setTodos(prev => prev.filter(t => t.id !== optimistic.id));
      throw e;
    }
  }

  async function toggle(id, done) {
    const prev = todos;
    setTodos(todos.map(t => (t.id === id ? { ...t, done } : t)));
    try {
      await updateTodo(id, { done });
    } catch (e) {
      setTodos(prev);
    }
  }

  async function rename(id, title) {
    const t = (title || '').trim();
    if (!t) return;
    const prev = todos;
    setTodos(todos.map(x => (x.id === id ? { ...x, title: t } : x)));
    try {
      await updateTodo(id, { title: t });
    } catch (e) {
      setTodos(prev);
    }
  }

  async function remove(id) {
    const prev = todos;
    setTodos(todos.filter(t => t.id !== id));
    try {
      await deleteTodo(id);
    } catch (e) {
      setTodos(prev);
    }
  }

  const filtered = useMemo(() => {
    if (filter === 'active') return todos.filter(t => !t.done);
    if (filter === 'done') return todos.filter(t => t.done);
    return todos;
  }, [todos, filter]);

  return (
    <div className="container">
      <header>
        <h1>Todos</h1>
        <nav className="tabs">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
          <button className={filter === 'done' ? 'active' : ''} onClick={() => setFilter('done')}>Done</button>
        </nav>
      </header>

      <TodoForm onAdd={addTodo} />

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <ul className="todo-list">
        {filtered.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggle}
            onRename={rename}
            onDelete={remove}
          />
        ))}
      </ul>
    </div>
  );
}
