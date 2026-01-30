const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management';
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Using localhost. Create backend/.env with MONGODB_URI=your_atlas_uri (copy from .env.example).');
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('Tip: If using local MongoDB, start it (e.g. mongod or brew services start mongodb-community).');
      console.error('Tip: If using Atlas, check MONGODB_URI and Network Access (allow your IP or 0.0.0.0/0).');
    }
    throw err;
  }
};

module.exports = connectDB;
