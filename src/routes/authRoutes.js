const express = require('express');
const { login, register } = require('../controllers/authController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/login', login);
router.post('/register', optionalAuth, register);

module.exports = router;
