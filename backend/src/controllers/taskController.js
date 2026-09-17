const db = require('../config/db');

const ALLOWED_SORT_FIELDS = {
  createdAt: 'created_at',
  dueDate: 'due_date',
  priority: 'priority',
  status: 'status',
  title: 'title',
};

// Priority/status weights so sorting "by priority"/"by status" is meaningful,
// not just alphabetical.
const PRIORITY_CASE = `CASE priority WHEN 'High' THEN 3 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 1 END`;
const STATUS_CASE = `CASE status WHEN 'Pending' THEN 1 WHEN 'In Progress' THEN 2 WHEN 'Completed' THEN 3 END`;

function emitToUser(req, event, payload) {
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${req.user.id}`).emit(event, payload);
  }
}

function serializeTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// @route GET /api/tasks
// Supports: ?search=&status=&priority=&sortBy=&order=asc|desc&page=&limit=
async function getTasks(req, res, next) {
  try {
    const {
      search = '',
      status,
      priority,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const conditions = ['user_id = $1'];
    const params = [req.user.id];
    let idx = 2;

    if (search) {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (status) {
      conditions.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }
    if (priority) {
      conditions.push(`priority = $${idx}`);
      params.push(priority);
      idx++;
    }

    let orderColumn = 'created_at';
    if (sortBy === 'priority') orderColumn = PRIORITY_CASE;
    else if (sortBy === 'status') orderColumn = STATUS_CASE;
    else if (ALLOWED_SORT_FIELDS[sortBy]) orderColumn = ALLOWED_SORT_FIELDS[sortBy];

    const orderDirection = order && order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const whereClause = conditions.join(' AND ');

    const dataQuery = `
      SELECT * FROM tasks
      WHERE ${whereClause}
      ORDER BY ${orderColumn} ${orderDirection}, created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    const dataParams = [...params, safeLimit, offset];

    const countQuery = `SELECT COUNT(*)::int AS count FROM tasks WHERE ${whereClause}`;

    const [dataResult, countResult] = await Promise.all([
      db.query(dataQuery, dataParams),
      db.query(countQuery, params),
    ]);

    res.json({
      tasks: dataResult.rows.map(serializeTask),
      total: countResult.rows[0].count,
      page: safePage,
      limit: safeLimit,
    });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/tasks/stats
async function getStats(req, res, next) {
  try {
    const result = await db.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'In Progress')::int AS in_progress,
         COUNT(*) FILTER (WHERE status = 'Completed')::int AS completed,
         COUNT(*) FILTER (WHERE priority = 'High')::int AS high_priority,
         COUNT(*) FILTER (WHERE priority = 'Medium')::int AS medium_priority,
         COUNT(*) FILTER (WHERE priority = 'Low')::int AS low_priority,
         COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status <> 'Completed')::int AS overdue
       FROM tasks WHERE user_id = $1`,
      [req.user.id]
    );

    const row = result.rows[0];
    res.json({
      total: row.total,
      byStatus: {
        Pending: row.pending,
        'In Progress': row.in_progress,
        Completed: row.completed,
      },
      byPriority: {
        High: row.high_priority,
        Medium: row.medium_priority,
        Low: row.low_priority,
      },
      overdue: row.overdue,
    });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/tasks/:id
async function getTaskById(req, res, next) {
  try {
    const result = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ task: serializeTask(result.rows[0]) });
  } catch (err) {
    next(err);
  }
}

// @route POST /api/tasks
async function createTask(req, res, next) {
  try {
    const { title, description = '', status = 'Pending', priority = 'Medium', dueDate = null } = req.body;

    const result = await db.query(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, title, description, status, priority, dueDate]
    );

    const task = serializeTask(result.rows[0]);
    emitToUser(req, 'task:created', task);
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

// @route PUT /api/tasks/:id
async function updateTask(req, res, next) {
  try {
    const existing = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [
      req.params.id,
      req.user.id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const current = existing.rows[0];
    const {
      title = current.title,
      description = current.description,
      status = current.status,
      priority = current.priority,
      dueDate = current.due_date,
    } = req.body;

    const result = await db.query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3, priority = $4, due_date = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, description, status, priority, dueDate, req.params.id, req.user.id]
    );

    const task = serializeTask(result.rows[0]);
    emitToUser(req, 'task:updated', task);
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

// @route DELETE /api/tasks/:id
async function deleteTask(req, res, next) {
  try {
    const result = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [
      req.params.id,
      req.user.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    emitToUser(req, 'task:deleted', { id: req.params.id });
    res.json({ message: 'Task deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTasks,
  getStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
