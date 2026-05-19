const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { aiAssist, generateTaskDescription, suggestSubtasks } = require('../controllers/ai');

router.use(authenticate);

router.post('/assist', aiAssist);
router.post('/generate-description', generateTaskDescription);
router.post('/suggest-subtasks', suggestSubtasks);

module.exports = router;
