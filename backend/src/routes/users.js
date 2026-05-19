const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { listUsers, updateUserRole, deleteUser } = require('../controllers/users');

router.use(authenticate, requireAdmin);

router.get('/', listUsers);
router.put('/:userId/role', updateUserRole);
router.delete('/:userId', deleteUser);

module.exports = router;
