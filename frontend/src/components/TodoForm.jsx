import { useState } from 'react';

export default function TodoForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setLoading(true);
    try {
      await onAdd(t);
      setTitle('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card">
      <input
        className="input"
        placeholder="Add a todo..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={loading}
      />
      <button className="btn" disabled={loading || !title.trim()}>
        {loading ? 'Adding…' : 'Add'}
      </button>
    </form>
  );
}
