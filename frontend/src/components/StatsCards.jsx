import React from 'react';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      className: 'stat-total',
    },
    {
      label: 'Pending',
      value: stats.byStatus.Pending,
      className: 'stat-pending',
    },
    {
      label: 'In Progress',
      value: stats.byStatus['In Progress'],
      className: 'stat-progress',
    },
    {
      label: 'Completed',
      value: stats.byStatus.Completed,
      className: 'stat-completed',
    },
    {
      label: 'High Priority',
      value: stats.byPriority.High,
      className: 'stat-overdue',
    },
    {
      label: 'Medium Priority',
      value: stats.byPriority.Medium,
      className: 'stat-pending',
    },
    {
      label: 'Low Priority',
      value: stats.byPriority.Low,
      className: 'stat-progress',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      className: 'stat-overdue',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`stat-card ${card.className}`}
        >
          <span className="stat-value">{card.value}</span>
          <span className="stat-label">{card.label}</span>
        </div>
      ))}
    </div>
  );
}