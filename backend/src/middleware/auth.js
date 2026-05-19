const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow-secret-key-change-in-production';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function requireProjectAccess(req, res, next) {
  const projectId = parseInt(req.params.projectId || req.body.project_id);
  if (!projectId) return next();

  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const member = db.prepare(
    'SELECT * FROM project_members WHERE project_id = ? AND user_id = ?'
  ).get(projectId, req.user.id);

  const isOwner = project.owner_id === req.user.id;
  const isGlobalAdmin = req.user.role === 'admin';

  if (!member && !isOwner && !isGlobalAdmin) {
    return res.status(403).json({ error: 'You are not a member of this project' });
  }

  req.project = project;
  req.projectRole = isOwner || isGlobalAdmin ? 'admin' : member.role;
  next();
}

function requireProjectAdmin(req, res, next) {
  if (req.projectRole !== 'admin') {
    return res.status(403).json({ error: 'Project admin access required' });
  }
  next();
}

module.exports = { authenticate, requireAdmin, requireProjectAccess, requireProjectAdmin, JWT_SECRET };
