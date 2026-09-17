import React from 'react';

const STATUS_CLASS = {
  Pending: 'badge-pending',
  'In Progress': 'badge-progress',
  Completed: 'badge-completed',
};

const PRIORITY_CLASS = {
  Low: 'badge-low',
  Medium: 'badge-medium',
  High: 'badge-high',
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'Completed') return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className={`task-card ${overdue ? 'task-overdue' : ''}`}>
      <div className="task-card-top">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-badges">
          <span className={`badge ${PRIORITY_CLASS[task.priority]}`}>{task.priority}</span>
        </div>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-meta">
        {task.dueDate && (
          <span className={`due-date ${overdue ? 'overdue-text' : ''}`}>
            📅 {formatDate(task.dueDate)} {overdue && '(overdue)'}
          </span>
        )}
      </div>

      <div className="task-card-bottom">
        <select
          className={`status-select ${STATUS_CLASS[task.status]}`}
          value={task.status}
          onChange={(e) => onStatusChange(task, e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <div className="task-actions">
          <button className="icon-btn" title="Edit task" onClick={() => onEdit(task)}>
            ✏️
          </button>
          <button className="icon-btn icon-btn-danger" title="Delete task" onClick={() => onDelete(task)}>
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
