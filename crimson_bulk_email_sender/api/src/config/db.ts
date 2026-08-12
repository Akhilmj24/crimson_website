// @ts-nocheck
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

let dbConnected = false;

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin@123', 10);
      await User.create({
        username: 'admin',
        name: 'Administrator',
        password: hashedPassword,
        role: 'super_admin',
        tenantId: 'default-tenant',
        createdBy: 'system'
      });
      console.log('Default super_admin user "admin" seeded successfully.');
    }
  } catch (err) {
    console.error('Failed to seed default admin user:', err.message);
  }
};

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crimson_emails';
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully via src/config/db');
    dbConnected = true;
    await seedAdmin();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.log('Running in Fallback Mode (campaign histories stored in-memory)');
    dbConnected = false;
  }
};

const isDBConnected = () => dbConnected;

export { 
  connectDB,
  isDBConnected
 };
