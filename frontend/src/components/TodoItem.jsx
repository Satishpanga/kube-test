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
