const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { isDBConnected } = require('../config/db');

const JWT_SECRET = process.env.ACCESS_TOKEN || 'crimson_secret_key';

// Fallback in-memory users list when DB is offline
const inMemoryUsers = [];
bcrypt.hash('admin@123', 10).then(hashed => {
  inMemoryUsers.push({
    _id: 'fallback-admin-id',
    username: 'admin',
    password: hashed,
    role: 'super_admin',
    tenantId: 'default-tenant',
    isDeleted: false,
    createdBy: 'system'
  });
});

// User Login
const login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError('Please provide username and password', 400));
  }

  const dbConnected = isDBConnected();
  let user;

  if (dbConnected) {
    try {
      user = await User.findOne({ username, isDeleted: false });
    } catch (err) {
      console.warn('MongoDB query failed during login, falling back to in-memory.', err.message);
    }
  }

  // If DB is offline or query failed, search in memory
  if (!user) {
    user = inMemoryUsers.find(u => u.username === username && !u.isDeleted);
  }

  if (!user) {
    return next(new AppError('Invalid username or password', 401));
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError('Invalid username or password', 401));
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role, tenantId: user.tenantId },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
      tenantId: user.tenantId
    }
  });
});

// List Users (Admins and Super Admins only)
const getUsers = catchAsync(async (req, res, next) => {
  if (req.userRole !== 'super_admin' && req.userRole !== 'Admin') {
    return next(new AppError('Forbidden: Only admins can manage users', 403));
  }

  const dbConnected = isDBConnected();
  if (dbConnected) {
    try {
      const filter = { isDeleted: false };
      if (req.userRole === 'Admin') {
        filter.tenantId = req.tenantId;
      }
      const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
      return res.json(users);
    } catch (err) {
      console.warn('MongoDB query failed for getUsers, falling back to in-memory.', err.message);
    }
  }

  // Fallback in-memory
  const filtered = inMemoryUsers.filter(u => !u.isDeleted && (req.userRole === 'super_admin' || u.tenantId === req.tenantId));
  const sanitized = filtered.map(({ password, ...rest }) => rest);
  res.json(sanitized);
});

// Create Staff User (Admins and Super Admins only)
const createUser = catchAsync(async (req, res, next) => {
  if (req.userRole !== 'super_admin' && req.userRole !== 'Admin') {
    return next(new AppError('Forbidden: Only admins can manage users', 403));
  }

  const { username, password, role, tenantId } = req.body;

  if (!username || !password || !role) {
    return next(new AppError('Please provide username, password, and role', 400));
  }

  const allowedRoles = ['Admin', 'Manager', 'Agent'];
  if (!allowedRoles.includes(role)) {
    return next(new AppError('Invalid role specified', 400));
  }

  // Check username uniqueness
  const dbConnected = isDBConnected();
  let usernameExists = false;

  if (dbConnected) {
    try {
      const existing = await User.findOne({ username });
      if (existing) usernameExists = true;
    } catch (err) {
      console.warn('MongoDB check failed for username uniqueness, using in-memory.', err.message);
    }
  }

  if (!usernameExists) {
    const existingInMemory = inMemoryUsers.find(u => u.username === username && !u.isDeleted);
    if (existingInMemory) usernameExists = true;
  }

  if (usernameExists) {
    return next(new AppError('Username is already taken', 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userTenant = req.userRole === 'super_admin' ? (tenantId || 'default-tenant') : req.tenantId;

  if (dbConnected) {
    try {
      const newUser = await User.create({
        username,
        password: hashedPassword,
        role,
        tenantId: userTenant,
        createdBy: req.userId || 'admin'
      });

      return res.status(201).json({
        success: true,
        user: {
          id: newUser._id,
          username: newUser.username,
          role: newUser.role,
          tenantId: newUser.tenantId
        }
      });
    } catch (err) {
      console.warn('MongoDB failed to create user, falling back to in-memory.', err.message);
    }
  }

  // Fallback in-memory
  const id = 'user_mem_' + Date.now();
  const newUser = {
    _id: id,
    username,
    password: hashedPassword,
    role,
    tenantId: userTenant,
    isDeleted: false,
    createdBy: req.userId || 'admin',
    createdAt: new Date()
  };
  inMemoryUsers.push(newUser);

  res.status(201).json({
    success: true,
    user: {
      id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      tenantId: newUser.tenantId
    }
  });
});

// Delete User (Admins and Super Admins only)
const deleteUser = catchAsync(async (req, res, next) => {
  if (req.userRole !== 'super_admin' && req.userRole !== 'Admin') {
    return next(new AppError('Forbidden: Only admins can manage users', 403));
  }

  const dbConnected = isDBConnected();
  if (dbConnected && !req.params.id.startsWith('user_mem_')) {
    try {
      const user = await User.findOne({ _id: req.params.id, isDeleted: false });
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      if (req.userRole === 'Admin' && user.role === 'super_admin') {
        return next(new AppError('Forbidden: Admins cannot delete Super Admins', 403));
      }

      user.isDeleted = true;
      await user.save();

      return res.json({
        success: true,
        message: 'User account soft-deleted successfully'
      });
    } catch (err) {
      console.warn('MongoDB failed to delete user, checking in-memory.', err.message);
    }
  }

  // Fallback in-memory delete
  const user = inMemoryUsers.find(u => u._id === req.params.id && !u.isDeleted);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (req.userRole === 'Admin' && user.role === 'super_admin') {
    return next(new AppError('Forbidden: Admins cannot delete Super Admins', 403));
  }

  user.isDeleted = true;
  res.json({
    success: true,
    message: 'User account soft-deleted successfully'
  });
});

module.exports = {
  login,
  getUsers,
  createUser,
  deleteUser
};
