import React from 'react';

export default function FilterBar({ filters, onChange }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="filter-bar">
      <input
        type="text"
        className="search-input"
        placeholder="🔍 Search tasks by title or description..."
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
      />

      <select value={filters.status} onChange={(e) => update('status', e.target.value)}>
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>

      <select value={filters.priority} onChange={(e) => update('priority', e.target.value)}>
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <select value={filters.sortBy} onChange={(e) => update('sortBy', e.target.value)}>
        <option value="createdAt">Sort: Newest</option>
        <option value="dueDate">Sort: Due Date</option>
        <option value="priority">Sort: Priority</option>
        <option value="status">Sort: Status</option>
        <option value="title">Sort: Title</option>
      </select>

      <button
        className="btn btn-ghost"
        onClick={() => update('order', filters.order === 'asc' ? 'desc' : 'asc')}
        title="Toggle sort order"
      >
        {filters.order === 'asc' ? '↑ Asc' : '↓ Desc'}
      </button>
    </div>
  );
}
