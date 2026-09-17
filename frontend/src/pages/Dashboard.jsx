import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import StatsCards from '../components/StatsCards';
import TaskCard from '../components/TaskCard';
import { fetchStats, fetchTasks, updateTask, deleteTask } from '../api/taskApi';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [statsData, tasksData] = await Promise.all([
        fetchStats(),
        fetchTasks({ sortBy: 'priority', order: 'desc', limit: 6 }),
      ]);
      setStats(statsData);
      setRecentTasks(tasksData.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live updates: whenever a task changes anywhere, refresh dashboard data.
  useEffect(() => {
    if (!socket) return;

    const refresh = () => loadData();

    socket.on('task:created', refresh);
    socket.on('task:updated', refresh);
    socket.on('task:deleted', refresh);

    return () => {
      socket.off('task:created', refresh);
      socket.off('task:updated', refresh);
      socket.off('task:deleted', refresh);
    };
  }, [socket, loadData]);

  async function handleStatusChange(task, newStatus) {
    try {
      await updateTask(task.id, { status: newStatus });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;

    try {
      await deleteTask(task.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  }

  return (
    <div className="page">
      <Navbar />

      <main className="container">
        <div className="page-header">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">
              Here's an overview of your tasks.
            </p>
          </div>

          <Link to="/tasks" className="btn btn-primary">
            + New Task
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <Loader label="Loading dashboard..." />
        ) : (
          <>
            <StatsCards stats={stats} />

            <div className="section-header">
              <h2>Recent Tasks</h2>
              <Link to="/tasks">View all →</Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks yet. Create your first task to get started!</p>

                <Link to="/tasks" className="btn btn-primary">
                  Create Task
                </Link>
              </div>
            ) : (
              <div className="task-grid">
                {recentTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => (window.location.href = '/tasks')}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}