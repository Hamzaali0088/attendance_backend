const Attendance = require('../models/Attendance');
const Excuse = require('../models/Excuse');
const User = require('../models/User');

const normalizeDate = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

/** Parse YYYY-MM-DD as local date (avoids UTC-midnight timezone shift). */
const parseLocalDate = (str) => {
  if (!str || typeof str !== 'string') return null;
  const parts = str.trim().split(/[-/]/).map(Number);
  if (parts.length < 3) return null;
  const [y, m, d] = parts;
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getAttendanceStatus = async (userId, date) => {
  const normalizedDate = normalizeDate(date);
  const attendance = await Attendance.findOne({ userId, date: normalizedDate });
  if (attendance && attendance.loginTime && attendance.logoutTime) {
    return { ...attendance.toObject(), status: 'Present' };
  }
  const excuse = await Excuse.findOne({
    userId,
    date: normalizedDate,
    status: 'Approved',
  });
  if (excuse) {
    return attendance
      ? { ...attendance.toObject(), status: 'Excused' }
      : {
          userId,
          date: normalizedDate,
          loginTime: null,
          logoutTime: null,
          workingHours: 0,
          status: 'Excused',
        };
  }
  return attendance
    ? { ...attendance.toObject(), status: attendance.loginTime ? 'Present' : 'Absent' }
    : {
        userId,
        date: normalizedDate,
        loginTime: null,
        logoutTime: null,
        workingHours: 0,
        status: 'Absent',
      };
};

const getAttendanceForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.user._id.toString();
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);
    if (!isAdmin && userId != null && userId !== requestUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const targetUserId = userId || requestUserId;
    const days = parseInt(req.query.days) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const results = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const status = await getAttendanceStatus(targetUserId, new Date(d));
      results.push(status);
    }
    results.reverse();
    const presences = results.filter((r) => r.status === 'Present').length;
    const absences = results.filter((r) => r.status === 'Absent').length;
    const leaves = results.filter((r) => r.status === 'Excused').length;
    const totalOfficeHours = results.reduce((sum, r) => sum + (r.workingHours || 0), 0);
    res.json({
      attendance: results,
      summary: { presences, absences, leaves, totalOfficeHours },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markArrival = async (req, res) => {
  try {
    const { userId, date } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    const targetDate = date ? (parseLocalDate(date) || normalizeDate(new Date())) : normalizeDate(new Date());
    let attendance = await Attendance.findOne({ userId, date: targetDate });
    if (!attendance) {
      attendance = new Attendance({ userId, date: targetDate });
    }
    attendance.loginTime = new Date();
    attendance.status = 'Present';
    if (!attendance.logoutTime) {
      attendance.workingHours = 0;
    }
    await attendance.save();
    if (attendance.logoutTime) {
      const diff = new Date(attendance.logoutTime) - new Date(attendance.loginTime);
      attendance.workingHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
      await attendance.save();
    }
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markExit = async (req, res) => {
  try {
    const { userId, date } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    const targetDate = date ? (parseLocalDate(date) || normalizeDate(new Date())) : normalizeDate(new Date());
    let attendance = await Attendance.findOne({ userId, date: targetDate });
    if (!attendance) {
      attendance = new Attendance({ userId, date: targetDate });
    }
    attendance.logoutTime = new Date();
    if (attendance.loginTime) {
      const diff = new Date(attendance.logoutTime) - new Date(attendance.loginTime);
      attendance.workingHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
      attendance.status = 'Present';
    }
    await attendance.save();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllAttendanceForAdmin = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const users = await User.find({ role: 'user' }).select('_id username email');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const result = [];
    for (const user of users) {
      const rows = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const status = await getAttendanceStatus(user._id.toString(), new Date(d));
        rows.push(status);
      }
      result.push({ user, attendance: rows.reverse() });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAttendanceForUser,
  markArrival,
  markExit,
  getAllAttendanceForAdmin,
  getAttendanceStatus,
};
