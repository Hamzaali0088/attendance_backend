const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  loginTime: {
    type: Date,
    default: null,
  },
  logoutTime: {
    type: Date,
    default: null,
  },
  workingHours: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Excused'],
    default: 'Absent',
  },
}, {
  timestamps: true,
});

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

attendanceSchema.pre('save', function (next) {
  if (this.loginTime && this.logoutTime) {
    const diff = new Date(this.logoutTime) - new Date(this.loginTime);
    this.workingHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
    this.status = 'Present';
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
