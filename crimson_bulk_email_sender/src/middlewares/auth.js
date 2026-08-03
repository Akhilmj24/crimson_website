const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  // Authorization header validation (e.g. Bearer token)
  const authHeader = req.headers.authorization;
  
  if (process.env.ENFORCE_AUTH === 'true') {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Missing or invalid Bearer token', 401));
    }
    const token = authHeader.split(' ')[1];
    // Simple verification check matching env ACCESS_TOKEN
    if (token !== process.env.ACCESS_TOKEN) {
      return next(new AppError('Invalid authentication token', 401));
    }
  }

  next();
};
