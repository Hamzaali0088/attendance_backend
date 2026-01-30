const Excuse = require('../models/Excuse');
const Attendance = require('../models/Attendance');

const normalizeDate = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

const sendExcuse = async (req, res) => {
  try {
    const { date, message } = req.body;
    if (!date || !message) {
      return res.status(400).json({ error: 'Date and message required' });
    }
    const normalizedDate = normalizeDate(date);
    const existing = await Excuse.findOne({
      userId: req.user._id,
      date: normalizedDate,
    });
    if (existing) {
      return res.status(400).json({ error: 'Excuse already submitted for this date' });
    }
    const excuse = new Excuse({
      userId: req.user._id,
      date: normalizedDate,
      message,
      status: 'Pending',
    });
    await excuse.save();
    await excuse.populate('userId', 'username email');
    res.status(201).json(excuse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPendingExcuses = async (req, res) => {
  try {
    const excuses = await Excuse.find({ status: 'Pending' })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.json(excuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateExcuseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Approved or Rejected' });
    }
    const excuse = await Excuse.findById(id);
    if (!excuse) {
      return res.status(404).json({ error: 'Excuse not found' });
    }
    if (excuse.status !== 'Pending') {
      return res.status(400).json({ error: 'Excuse already processed' });
    }
    excuse.status = status;
    excuse.approvedBy = req.user._id;
    await excuse.save();
    await excuse.populate('userId', 'username email');
    await excuse.populate('approvedBy', 'username');
    res.json(excuse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { sendExcuse, getPendingExcuses, updateExcuseStatus };
