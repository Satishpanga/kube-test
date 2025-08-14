import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { todos: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Ensure DB file exists on first run
if (!fs.existsSync(DB_PATH)) {
  writeDB({ todos: [] });
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/api/todos', (req, res) => {
  const { todos } = readDB();
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const { title } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const db = readDB();
  const todo = { id: nanoid(), title: String(title).trim(), done: false, createdAt: Date.now() };
  db.todos.unshift(todo);
  writeDB(db);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title, done } = req.body || {};
  const db = readDB();
  const idx = db.todos.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  if (typeof title !== 'undefined') db.todos[idx].title = String(title).trim();
  if (typeof done !== 'undefined') db.todos[idx].done = !!done;
  writeDB(db);
  res.json(db.todos[idx]);
});

app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const before = db.todos.length;
  db.todos = db.todos.filter(t => t.id !== id);
  if (db.todos.length === before) return res.status(404).json({ error: 'Not found' });
  writeDB(db);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
