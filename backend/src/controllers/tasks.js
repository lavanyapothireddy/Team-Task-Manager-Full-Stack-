const { getDb } = require('../database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };

function listTasks(req, res) {
  const { projectId } = req.params;
  const { status, priority, assignee_id } = req.query;

  let query = `
    SELECT t.*, 
      u.name as assignee_name, u.email as assignee_email,
      c.name as creator_name
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    JOIN users c ON t.creator_id = c.id
    WHERE t.project_id = ?
  `;
  const params = [projectId];

  if (status) { query += ' AND t.status = ?'; params.push(status); }
  if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
  if (assignee_id) { query += ' AND t.assignee_id = ?'; params.push(assignee_id); }

  query += ' ORDER BY CASE t.priority WHEN "critical" THEN 0 WHEN "high" THEN 1 WHEN "medium" THEN 2 ELSE 3 END, t.created_at DESC';

  const tasks = db.prepare(query).all(...params);
  res.json({ tasks });
}

function createTask(req, res) {
  const { projectId } = req.params;
  const { title, description, priority, assignee_id, due_date } = req.body;

  if (!title) return res.status(400).json({ error: 'Task title is required' });

  // Validate assignee is project member
  if (assignee_id) {
    const member = db.prepare(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?'
    ).get(projectId, assignee_id);
    if (!member) return res.status(400).json({ error: 'Assignee must be a project member' });
  }

  const result = db.prepare(`
    INSERT INTO tasks (title, description, priority, project_id, assignee_id, creator_id, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, description || '', priority || 'medium', projectId, assignee_id || null, req.user.id, due_date || null);

  const task = db.prepare(`
    SELECT t.*, u.name as assignee_name, c.name as creator_name
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    JOIN users c ON t.creator_id = c.id
    WHERE t.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({ task });
}

function getTask(req, res) {
  const { taskId } = req.params;
  const task = db.prepare(`
    SELECT t.*, u.name as assignee_name, u.email as assignee_email, c.name as creator_name
    FROM tasks t
    LEFT JOIN users u ON t.assignee_id = u.id
    JOIN users c ON t.creator_id = c.id
    WHERE t.id = ?
  `).get(taskId);

  if (!task) return res.status(404).json({ error: 'Task not found' });

  const comments = db.prepare(`
    SELECT tc.*, u.name as user_name
    FROM task_comments tc
    JOIN users u ON tc.user_id = u.id
    WHERE tc.task_id = ?
    ORDER BY tc.created_at ASC
  `).all(taskId);

  res.json({ task, comments });
}

function updateTask(req, res) {
  const { taskId } = req.params;
  const { title, description, status, priority, assignee_id, due_date } = req.body;

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  // Members can only update status of their own tasks; admins can update anything
  const isAdmin = req.projectRole === 'admin';
  const isAssignee = task.assignee_id === req.user.id;

  if (!isAdmin && !isAssignee) {
    return res.status(403).json({ error: 'You can only update tasks assigned to you' });
  }

  db.prepare(`
    UPDATE tasks SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      priority = COALESCE(?, priority),
      assignee_id = CASE WHEN ? IS NULL THEN assignee_id ELSE ? END,
      due_date = COALESCE(?, due_date),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    isAdmin ? title : null,
    isAdmin ? description : null,
    status,
    isAdmin ? priority : null,
    isAdmin ? assignee_id : null, isAdmin ? assignee_id : null,
    isAdmin ? due_date : null,
    taskId
  );

  const updated = db.prepare(`
    SELECT t.*, u.name as assignee_name, c.name as creator_name
    FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id
    JOIN users c ON t.creator_id = c.id WHERE t.id = ?
  `).get(taskId);

  res.json({ task: updated });
}

function deleteTask(req, res) {
  const { taskId } = req.params;
  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  res.json({ message: 'Task deleted' });
}

function addComment(req, res) {
  const { taskId } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comment content is required' });

  const result = db.prepare(
    'INSERT INTO task_comments (task_id, user_id, content) VALUES (?, ?, ?)'
  ).run(taskId, req.user.id, content);

  const comment = db.prepare(`
    SELECT tc.*, u.name as user_name FROM task_comments tc
    JOIN users u ON tc.user_id = u.id WHERE tc.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json({ comment });
}

// Dashboard: all tasks for current user across projects
function getDashboard(req, res) {
  const userId = req.user.id;

  const myTasks = db.prepare(`
    SELECT t.*, p.name as project_name, u.name as assignee_name
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assignee_id = u.id
    WHERE t.assignee_id = ? AND t.status != 'done'
    ORDER BY t.due_date ASC, t.priority ASC
  `).all(userId);

  const overdueTasks = db.prepare(`
    SELECT t.*, p.name as project_name
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.assignee_id = ? AND t.due_date < DATE('now') AND t.status != 'done'
  `).all(userId);

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status='todo' THEN 1 ELSE 0 END) as todo,
      SUM(CASE WHEN status='in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status='review' THEN 1 ELSE 0 END) as review,
      SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as done,
      SUM(CASE WHEN due_date < DATE('now') AND status != 'done' THEN 1 ELSE 0 END) as overdue
    FROM tasks WHERE assignee_id = ?
  `).get(userId);

  const recentActivity = db.prepare(`
    SELECT t.id, t.title, t.status, t.updated_at, p.name as project_name
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = ?
    ORDER BY t.updated_at DESC LIMIT 10
  `).all(userId);

  res.json({ myTasks, overdueTasks, stats, recentActivity });
}

module.exports = { listTasks, createTask, getTask, updateTask, deleteTask, addComment, getDashboard };
