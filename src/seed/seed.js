require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Excuse = require('../models/Excuse');

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Attendance.deleteMany({});
  await Excuse.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await User.insertMany([
    { username: 'Alice', email: 'alice@example.com', passwordHash, role: 'user' },
    { username: 'Bob', email: 'bob@example.com', passwordHash, role: 'user' },
    { username: 'Admin', email: 'admin@example.com', passwordHash, role: 'admin' },
    { username: 'SuperAdmin', email: 'superadmin@example.com', passwordHash, role: 'superadmin' },
  ]);

  const [alice, bob] = users.filter((u) => u.role === 'user');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const login = new Date(d);
    login.setHours(9, 0, 0, 0);
    const logout = new Date(d);
    logout.setHours(17, 30, 0, 0);
    await Attendance.create({
      userId: alice._id,
      date: d,
      loginTime: login,
      logoutTime: logout,
      workingHours: 8.5,
      status: 'Present',
    });
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  await Excuse.create({
    userId: bob._id,
    date: yesterday,
    message: 'Doctor appointment.',
    status: 'Pending',
  });

  await Excuse.create({
    userId: alice._id,
    date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
    message: 'Family emergency.',
    status: 'Pending',
  });

  console.log('Seed completed. Users:');
  console.log('  user: alice@example.com / password123');
  console.log('  user: bob@example.com / password123');
  console.log('  admin: admin@example.com / password123');
  console.log('  superadmin: superadmin@example.com / password123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
