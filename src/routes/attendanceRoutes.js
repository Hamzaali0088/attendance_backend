const express = require('express');
const {
  getAttendanceForUser,
  markArrival,
  markExit,
  getAllAttendanceForAdmin,
} = require('../controllers/attendanceController');
const { auth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/admin/all', auth, requireRole('admin', 'superadmin'), getAllAttendanceForAdmin);
router.get('/:userId?', auth, getAttendanceForUser);
router.post('/mark-arrival', auth, requireRole('admin', 'superadmin'), markArrival);
router.post('/mark-exit', auth, requireRole('admin', 'superadmin'), markExit);

module.exports = router;
