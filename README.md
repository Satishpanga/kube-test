Repository: satishpanga/kube-test
Files analyzed: 23

Estimated tokens: 3.8k

Directory structure:
└── satishpanga-kube-test/
    ├── README.md
    ├── docker-compose.yaml
    ├── backend/
    │   ├── db.json
    │   ├── Dockerfile
    │   ├── package.json
    │   └── server.js
    ├── frontend/
    │   ├── Dockerfile
    │   ├── index.html
    │   ├── nginx.conf
    │   ├── package.json
    │   ├── vite.config.js
    │   └── src/
    │       ├── api.js
    │       ├── App.jsx
    │       ├── main.jsx
    │       ├── styles.css
    │       └── components/
    │           ├── TodoForm.jsx
    │           └── TodoItem.jsx
    └── k8s/
        ├── backend-deployment.yaml
        ├── backend-service.yaml
        ├── frontend-deployment.yaml
        ├── frontend-service.yaml
        ├── ingress.yaml
        └── namespace.yaml


================================================
FILE: README.md
================================================



================================================
FILE: docker-compose.yaml
================================================
version: "3.8"
services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    depends_on:
      - api
    restart: unless-stopped



================================================
FILE: backend/db.json
================================================



================================================
FILE: backend/Dockerfile
================================================
# Backend (Express)
FROM node:20-alpine

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source
COPY . .

ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]



================================================
FILE: backend/package.json
================================================
{
  "name": "fullstack-todos-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "morgan": "^1.10.0",
    "nanoid": "^5.0.7"
  }
}



================================================
FILE: backend/server.js
================================================
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



================================================
FILE: frontend/Dockerfile
================================================
# Stage 1: Build the frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]



================================================
FILE: frontend/index.html
================================================
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Full-Stack Todos</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>



================================================
FILE: frontend/nginx.conf
================================================
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}



================================================
FILE: frontend/package.json
================================================
{
  "name": "fullstack-todos-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}



================================================
FILE: frontend/vite.config.js
================================================
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify('https://api.ai4devops.online')
  }
});



================================================
FILE: frontend/src/api.js
================================================
const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export async function listTodos() {
  const res = await fetch(`${API_BASE}/todos`);
  if (!res.ok) throw new Error('Failed to fetch todos');
  return res.json();
}

export async function createTodo(title) {
  const res = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error('Failed to create todo');
  return res.json();
}

export async function updateTodo(id, data) {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update todo');
}

export async function deleteTodo(id) {
  const res = await fetch(`${API_BASE}/todos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete todo');
}



================================================
FILE: frontend/src/App.jsx
================================================
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



================================================
FILE: frontend/src/main.jsx
================================================
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



================================================
FILE: frontend/src/styles.css
================================================



================================================
FILE: frontend/src/components/TodoForm.jsx
================================================
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



================================================
FILE: frontend/src/components/TodoItem.jsx
================================================
export default function TodoItem({ todo, onToggle, onDelete, onRename }) {
  return (
    <li className={`todo ${todo.done ? 'done' : ''}`}>
      <label>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={e => onToggle(todo.id, e.target.checked)}
        />
        <span
          className="title"
          contentEditable
          suppressContentEditableWarning
          onBlur={e => onRename(todo.id, e.target.textContent)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        >
          {todo.title}
        </span>
      </label>
      <button className="icon" title="Delete" onClick={() => onDelete(todo.id)}>✕</button>
    </li>
  );
}



================================================
FILE: k8s/backend-deployment.yaml
================================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todos-backend
  namespace: react-test
spec:
  replicas: 2
  selector:
    matchLabels:
      app: todos-backend
  template:
    metadata:
      labels:
        app: todos-backend
    spec:
      containers:
        - name: todos-backend
          image: pangasathish/todos-backend:latest
          ports:
            - containerPort: 5000



================================================
FILE: k8s/backend-service.yaml
================================================
apiVersion: v1
kind: Service
metadata:
  name: todos-backend
  namespace: react-test
spec:
  selector:
    app: todos-backend
  ports:
    - port: 5000
      targetPort: 5000
  type: ClusterIP



================================================
FILE: k8s/frontend-deployment.yaml
================================================
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todos-frontend
  namespace: react-test
spec:
  replicas: 2
  selector:
    matchLabels:
      app: todos-frontend
  template:
    metadata:
      labels:
        app: todos-frontend
    spec:
      containers:
        - name: todos-frontend
          image: pangasathish/todos-frontend:latest
          ports:
            - containerPort: 3000



================================================
FILE: k8s/frontend-service.yaml
================================================
apiVersion: v1
kind: Service
metadata:
  name: todos-frontend
  namespace: react-test
spec:
  selector:
    app: todos-frontend
  ports:
    - port: 3000
      targetPort: 3000
  type: ClusterIP



================================================
FILE: k8s/ingress.yaml
================================================
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todos-ingress
  namespace: react-test
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod # Remove if not using TLS
spec:
  rules:
    - host: app.ai4devops.online
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: todos-frontend
                port:
                  number: 3000
    - host: api.ai4devops.online
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: todos-backend
                port:
                  number: 5000
  tls:
    - hosts:
        - app.ai4devops.online
        - api.ai4devops.online
      secretName: todos-tls



================================================
FILE: k8s/namespace.yaml
================================================
apiVersion: v1
kind: Namespace
metadata:
  name: react-test

