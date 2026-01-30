const bcrypt = require('bcryptjs');
const User = require('../models/User');

const listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('_id username email role').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const allowedRoles = ['user', 'admin', 'superadmin'];
    const userRole = role && allowedRoles.includes(role) ? role : 'user';
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: userRole,
    });
    res.status(201).json({
      id: user._id,
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, role, password } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (username != null) user.username = username.trim();
    if (email != null) user.email = email.toLowerCase().trim();
    if (role != null) {
      const allowed = ['user', 'admin', 'superadmin'];
      if (!allowed.includes(role)) {
        return res.status(400).json({ error: 'Role must be one of: user, admin, superadmin' });
      }
      user.role = role;
    }
    if (password != null && password.length > 0) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      user.passwordHash = await bcrypt.hash(password, 10);
    }
    await user.save();
    res.json({
      id: user._id,
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const allowed = ['user', 'admin', 'superadmin'];
    if (!role || !allowed.includes(role)) {
      return res.status(400).json({ error: 'Role must be one of: user, admin, superadmin' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.role = role;
    await user.save();
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // Superadmin can delete any user (including other superadmins) except themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listUsers, createUser, updateUser, updateUserRole, deleteUser };
