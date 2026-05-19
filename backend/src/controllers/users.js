const { getDb } = require('../database');
const db = { prepare: (...a) => getDb().prepare(...a), exec: (...a) => getDb().exec(...a) };

function listUsers(req, res) {
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
}

function updateUserRole(req, res) {
  const { userId } = req.params;
  const { role } = req.body;
  if (!['admin', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ error: 'Cannot change your own role' });
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId);
  res.json({ user });
}

function deleteUser(req, res) {
  const { userId } = req.params;
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.json({ message: 'User deleted' });
}

module.exports = { listUsers, updateUserRole, deleteUser };
