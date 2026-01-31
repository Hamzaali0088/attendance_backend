const express = require('express');
const { getRules, updateRules } = require('../controllers/ruleController');
const { auth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// All authenticated roles can view
router.get('/', auth, getRules);

// Only Super Admin can edit
router.put('/', auth, requireRole('superadmin'), updateRules);

module.exports = router;

