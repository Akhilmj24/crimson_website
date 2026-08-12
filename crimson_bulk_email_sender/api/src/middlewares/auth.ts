// @ts-nocheck
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError';

const JWT_SECRET = process.env.ACCESS_TOKEN || 'crimson_secret_key';

import User from '../models/User';
import { isDBConnected } from '../config/db';

export default async (req, res, next) => {
  // Authorization header validation (e.g. Bearer token)
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      req.userId = decoded.username; // Bind username as userId for logs
      req.userRole = decoded.role;
      req.tenantId = decoded.tenantId;

      // Try to fetch custom permissions
      if (isDBConnected()) {
        try {
          const user = await User.findById(decoded.id).select('customPermissions');
          if (user) {
            req.user.customPermissions = user.customPermissions;
          }
        } catch (err) {
          // ignore db errors
        }
      } else {
        // Find in memory user if possible - need to access authController's inMemoryUsers if we can, but it's not exported. 
        // For simplicity, we just won't apply customPermissions in fallback mode unless it's in the token.
      }

      return next();
    } catch (err) {
      return next(new AppError('Invalid or expired authentication token', 401));
    }
  }

  // Fallback check for env security settings
  if (process.env.ENFORCE_AUTH === 'true') {
    return next(new AppError('Authentication required. Missing Bearer token', 401));
  }

  next();
};
