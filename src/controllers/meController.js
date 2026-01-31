const bcrypt = require('bcryptjs');
const User = require('../models/User');

// PATCH /api/me  (update own username)
const updateMe = async (req, res) => {
  try {
    const { username } = req.body;
    if (username == null || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'username is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.username = username.trim();
    await user.save();

    return res.json({
      id: user._id,
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// PATCH /api/me/password  (update own password, requires currentPassword)
const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ error: 'currentPassword is required' });
    }
    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'newPassword is required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { updateMe, updateMyPassword };

