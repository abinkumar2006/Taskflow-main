import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import FilterBar from '../components/FilterBar';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/taskApi';
import { useSocket } from '../context/SocketContext';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  priority: '',
  sortBy: 'createdAt',
  order: 'desc',
};

export default function Tasks() {
  const { socket } = useSocket();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = useCallback(async (activeFilters) => {
    setLoading(true);

    try {
      const params = {};

      Object.entries(activeFilters).forEach(([k, v]) => {
        if (v) {
          params[k] = v;
        }
      });

      const data = await fetchTasks(params);

      setTasks(data.tasks);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search input so we don't hit the API on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      loadTasks(filters);
    }, 300);

    return () => clearTimeout(handle);
  }, [filters, loadTasks]);

  // Real-time sync across tabs/devices.
  useEffect(() => {
    if (!socket) return;

    const onCreated = (task) => {
      setTasks((prev) => {
        // Prevent the same task from being added twice.
        if (prev.some((t) => t.id === task.id)) {
          return prev;
        }

        return [task, ...prev];
      });
    };

    const onUpdated = (task) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? task : t))
      );
    };

    const onDeleted = ({ id }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    socket.on('task:created', onCreated);
    socket.on('task:updated', onUpdated);
    socket.on('task:deleted', onDeleted);

    return () => {
      socket.off('task:created', onCreated);
      socket.off('task:updated', onUpdated);
      socket.off('task:deleted', onDeleted);
    };
  }, [socket]);

  function openCreateModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTask(null);
  }

  async function handleSubmit(formData) {
    setSubmitting(true);

    try {
      if (editingTask) {
        const { task } = await updateTask(editingTask.id, formData);

        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? task : t))
        );
      } else {
        const { task } = await createTask(formData);

        // Prevent duplication when Socket.IO has already
        // added the newly-created task to the state.
        setTasks((prev) => {
          if (prev.some((t) => t.id === task.id)) {
            return prev;
          }

          return [task, ...prev];
        });
      }

      closeModal();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save task'
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(task, newStatus) {
    try {
      const { task: updated } = await updateTask(task.id, {
        status: newStatus,
      });

      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update task'
      );
    }
  }

  async function handleDelete(task) {
    if (
      !window.confirm(
        `Delete "${task.title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteTask(task.id);

      setTasks((prev) =>
        prev.filter((t) => t.id !== task.id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete task'
      );
    }
  }

  const emptyMessage = useMemo(() => {
    const hasActiveFilter =
      filters.search ||
      filters.status ||
      filters.priority;

    return hasActiveFilter
      ? 'No tasks match your filters. Try adjusting your search.'
      : 'No tasks yet. Create your first task to get started!';
  }, [filters]);

  return (
    <div className="page">
      <Navbar />

      <main className="container">
        <div className="page-header">
          <div>
            <h1>My Tasks</h1>

            <p className="page-subtitle">
              {tasks.length} task
              {tasks.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={openCreateModal}
          >
            + New Task
          </button>
        </div>

        <FilterBar
          filters={filters}
          onChange={setFilters}
        />

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {loading ? (
          <Loader label="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <TaskForm
          initialTask={editingTask}
          onSubmit={handleSubmit}
          onClose={closeModal}
          submitting={submitting}
        />
      )}
    </div>
  );
}