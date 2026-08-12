// @ts-nocheck
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { isDBConnected } from '../config/db';

const JWT_SECRET = process.env.ACCESS_TOKEN || 'crimson_secret_key';
const JWT_REFRESH_SECRET = process.env.REFRESH_TOKEN || 'crimson_refresh_secret_key';

// Fallback in-memory users list when DB is offline
const inMemoryUsers = [];
bcrypt.hash('admin@123', 10).then(hashed => {
  inMemoryUsers.push({
    _id: 'fallback-admin-id',
    username: 'admin',
    name: 'Administrator',
    password: hashed,
    role: 'super_admin',
    tenantId: 'default-tenant',
    isDeleted: false,
    createdBy: 'system',
    customPermissions: {}
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

  // Generate access & refresh JWT tokens
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role, tenantId: user.tenantId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user._id, username: user.username, role: user.role, tenantId: user.tenantId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Save refresh token
  if (dbConnected) {
    try {
      await User.findByIdAndUpdate(user._id, { refreshToken });
    } catch (err) {
      console.warn('Failed to save refresh token in MongoDB', err.message);
    }
  }

  const inMemUser = inMemoryUsers.find(u => u._id === user._id || u.username === user.username);
  if (inMemUser) {
    inMemUser.refreshToken = refreshToken;
  }

  res.json({
    success: true,
    token,
    refreshToken,
    user: {
      id: user._id,
      username: user.username,
      name: user.name || '',
      role: user.role,
      tenantId: user.tenantId,
      customPermissions: user.customPermissions || {}
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

  const { username, password, role, tenantId, name } = req.body;

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
        name: name || '',
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
          name: newUser.name || '',
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
    name: name || '',
    password: hashedPassword,
    role,
    tenantId: userTenant,
    isDeleted: false,
    createdBy: req.userId || 'admin',
    createdAt: new Date(),
    customPermissions: {}
  };
  inMemoryUsers.push(newUser);

  res.status(201).json({
    success: true,
    user: {
      id: newUser._id,
      username: newUser.username,
      name: newUser.name || '',
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

const refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const dbConnected = isDBConnected();
    let user;

    if (dbConnected) {
      try {
        user = await User.findOne({ _id: decoded.id, isDeleted: false });
      } catch (err) {
        console.warn('MongoDB query failed during refresh, falling back to in-memory.', err.message);
      }
    }

    if (!user) {
      user = inMemoryUsers.find(u => u._id === decoded.id && !u.isDeleted);
    }

    if (!user) {
      return next(new AppError('User not found or deleted', 401));
    }

    if (user.refreshToken !== refreshToken) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Generate new access token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, tenantId: user.tenantId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      refreshToken
    });
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
});

// Get all users under the current tenant for selectors (all authenticated roles can access)
const getUsersList = catchAsync(async (req, res, next) => {
  const dbConnected = isDBConnected();
  if (dbConnected) {
    try {
      const filter = { isDeleted: false };
      if (req.userRole !== 'super_admin') {
        filter.tenantId = req.tenantId;
      }
      const users = await User.find(filter).select('username name role').sort({ name: 1, username: 1 });
      return res.json(users);
    } catch (err) {
      console.warn('MongoDB query failed for getUsersList, falling back to in-memory.', err.message);
    }
  }

  // Fallback in-memory
  const filtered = inMemoryUsers.filter(u => !u.isDeleted && (req.userRole === 'super_admin' || u.tenantId === req.tenantId));
  const sanitized = filtered.map(({ _id, username, name, role }) => ({ _id, username, name, role }));
  res.json(sanitized);
});

// Update User Permissions (Admins and Super Admins only)
const updateUserPermissions = catchAsync(async (req, res, next) => {
  if (req.userRole !== 'super_admin' && req.userRole !== 'Admin') {
    return next(new AppError('Forbidden: Only admins can manage permissions', 403));
  }

  const { id } = req.params;
  const { customPermissions } = req.body;

  if (!customPermissions || typeof customPermissions !== 'object') {
    return next(new AppError('Invalid custom permissions data', 400));
  }

  const dbConnected = isDBConnected();
  if (dbConnected && !id.startsWith('user_mem_')) {
    try {
      const user = await User.findOne({ _id: id, isDeleted: false });
      if (!user) {
        return next(new AppError('User not found', 404));
      }

      // Check tenant bounds
      if (req.userRole === 'Admin' && user.tenantId !== req.tenantId) {
        return next(new AppError('Forbidden: User not in your tenant', 403));
      }

      user.customPermissions = customPermissions;
      user.markModified('customPermissions');
      await user.save();

      return res.json({
        success: true,
        message: 'User permissions updated successfully',
        customPermissions: user.customPermissions
      });
    } catch (err) {
      console.warn('MongoDB failed to update permissions, checking in-memory.', err.message);
    }
  }

  // Fallback in-memory update
  const user = inMemoryUsers.find(u => u._id === id && !u.isDeleted);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (req.userRole === 'Admin' && user.tenantId !== req.tenantId) {
    return next(new AppError('Forbidden: User not in your tenant', 403));
  }

  user.customPermissions = customPermissions;
  res.json({
    success: true,
    message: 'User permissions updated successfully (in-memory)',
    customPermissions: user.customPermissions
  });
});

export default { 
  login,
  getUsers,
  createUser,
  deleteUser,
  refresh,
  getUsersList,
  updateUserPermissions
 };
