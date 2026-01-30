const express = require('express');
const { listUsers, createUser, updateUser, updateUserRole, deleteUser } = require('../controllers/userController');
const { auth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth);
router.use(requireRole('superadmin'));

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:userId/role', updateUserRole);
router.patch('/:userId', updateUser);
router.delete('/:userId', deleteUser);

module.exports = router;
