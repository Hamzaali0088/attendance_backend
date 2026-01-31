const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const { updateMe, updateMyPassword } = require('../controllers/meController');

const router = express.Router();

router.use(auth);

router.patch('/', updateMe);
router.patch('/password', updateMyPassword);

module.exports = router;

