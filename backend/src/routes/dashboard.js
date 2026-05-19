const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getDb } = require('../database');
const db = { prepare: (...a) => getDb().prepare(...a) };

router.get('/', authenticate, (req, res) => {
  try {
    const userId = req.user.id;

    // Projects user belongs to
    const projects = db.prepare(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as done_tasks
      FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.owner_id = ? OR pm.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `).all(userId, userId);

    // My assigned tasks
    const myTasks = db.prepare(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.assignee_id = ? AND t.status != 'done'
      ORDER BY t.due_date ASC
      LIMIT 10
    `).all(userId);

    // Stats
    const totalProjects = projects.length;

    const assignedTasks = db.prepare(
      `SELECT COUNT(*) as c FROM tasks WHERE assignee_id = ?`
    ).get(userId).c;

    const completedTasks = db.prepare(
      `SELECT COUNT(*) as c FROM tasks WHERE assignee_id = ? AND status = 'done'`
    ).get(userId).c;

    const overdueTasks = db.prepare(
      `SELECT COUNT(*) as c FROM tasks WHERE assignee_id = ? AND status != 'done' AND due_date < date('now')`
    ).get(userId).c;

    const inProgressTasks = db.prepare(
      `SELECT COUNT(*) as c FROM tasks WHERE assignee_id = ? AND status = 'in_progress'`
    ).get(userId).c;

    res.json({
      stats: { totalProjects, assignedTasks, completedTasks, overdueTasks, inProgressTasks },
      projects,
      myTasks
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
