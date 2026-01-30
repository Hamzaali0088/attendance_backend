const express = require('express');
const {
  sendExcuse,
  getPendingExcuses,
  updateExcuseStatus,
} = require('../controllers/excuseController');
const { auth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', auth, requireRole('user'), sendExcuse);
router.get('/pending', auth, requireRole('superadmin'), getPendingExcuses);
router.patch('/:id', auth, requireRole('superadmin'), updateExcuseStatus);

module.exports = router;
