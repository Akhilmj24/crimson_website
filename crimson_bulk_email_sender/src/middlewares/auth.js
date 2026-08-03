const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.ACCESS_TOKEN || 'crimson_secret_key';

module.exports = (req, res, next) => {
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
