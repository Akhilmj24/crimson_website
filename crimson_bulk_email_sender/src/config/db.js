const mongoose = require('mongoose');

let dbConnected = false;

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crimson_emails';
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully via src/config/db');
    dbConnected = true;
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.log('Running in Fallback Mode (campaign histories stored in-memory)');
  }
};

const isDBConnected = () => dbConnected;

module.exports = {
  connectDB,
  isDBConnected
};
