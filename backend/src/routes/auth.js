const router = require('express').Router();
const { signup, login, getMe, updateProfile } = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfile);

module.exports = router;
