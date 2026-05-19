const router = require('express').Router();
const { authenticate, requireProjectAccess, requireProjectAdmin } = require('../middleware/auth');
const {
  listProjects, createProject, getProject, updateProject, deleteProject,
  addMember, removeMember, updateMemberRole
} = require('../controllers/projects');
const { listTasks, createTask } = require('../controllers/tasks');

router.use(authenticate);

router.get('/', listProjects);
router.post('/', createProject);

router.get('/:projectId', requireProjectAccess, getProject);
router.put('/:projectId', requireProjectAccess, requireProjectAdmin, updateProject);
router.delete('/:projectId', requireProjectAccess, requireProjectAdmin, deleteProject);

// Members
router.post('/:projectId/members', requireProjectAccess, requireProjectAdmin, addMember);
router.delete('/:projectId/members/:userId', requireProjectAccess, requireProjectAdmin, removeMember);
router.put('/:projectId/members/:userId', requireProjectAccess, requireProjectAdmin, updateMemberRole);

// Tasks within project
router.get('/:projectId/tasks', requireProjectAccess, listTasks);
router.post('/:projectId/tasks', requireProjectAccess, createTask);

module.exports = router;
