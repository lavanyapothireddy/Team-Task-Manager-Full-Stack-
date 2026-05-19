const router = require('express').Router();
const { authenticate, requireProjectAccess } = require('../middleware/auth');
const { getTask, updateTask, deleteTask, addComment, getDashboard } = require('../controllers/tasks');

router.use(authenticate);

router.get('/dashboard', getDashboard);

// Task must belong to a project - middleware handles auth
router.get('/:projectId/tasks/:taskId', requireProjectAccess, getTask);
router.put('/:projectId/tasks/:taskId', requireProjectAccess, updateTask);
router.delete('/:projectId/tasks/:taskId', requireProjectAccess, deleteTask);
router.post('/:projectId/tasks/:taskId/comments', requireProjectAccess, addComment);

module.exports = router;
