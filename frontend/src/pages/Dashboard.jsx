const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getDb } = require('../database');
const db = { prepare: (...a) => getDb().prepare(...a) };

router.get('/', authenticate, (req, res) => {
  try {
    const userId = req.user.id;

    // Stats matching frontend: stats.total, stats.in_progress, stats.done, stats.overdue
    const total = db.prepare(
      `SELECT COUNT(*) as c FROM tasks WHERE assignee_id = ?`
    ).get(userId).c;

    const in_progress = db.prepare(
      `SELECT COUNT(*) as c FROM tasks WHERE assignee_id = ? AND status = 'in_progress'`
    ).get(userId).c;

    const done = db.prepare(
      `SELECT COUNT(*) as c FROM tasks WHERE assignee_id = ? AND status = 'done'`
    ).get(userId).c;

    const overdue = db.prepare(
      `SELECT COUNT(*) as c FROM tasks WHERE assignee_id = ? AND status != 'done' AND due_date < date('now')`
    ).get(userId).c;

    const stats = { total, in_progress, done, overdue };

    // My pending tasks (not done), with project name
    const myTasks = db.prepare(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.assignee_id = ? AND t.status != 'done'
      ORDER BY t.due_date ASC
      LIMIT 8
    `).all(userId);

    // Overdue tasks
    const overdueTasks = db.prepare(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.assignee_id = ? AND t.status != 'done' AND t.due_date < date('now')
      ORDER BY t.due_date ASC
    `).all(userId);

    // Recent activity — tasks updated recently in projects user belongs to
    const recentActivity = db.prepare(`
      SELECT t.id, t.title, t.status, t.updated_at, p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE (pm.user_id = ? OR p.owner_id = ?)
      GROUP BY t.id
      ORDER BY t.updated_at DESC
      LIMIT 8
    `).all(userId, userId);

    res.json({ stats, myTasks, overdueTasks, recentActivity });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
