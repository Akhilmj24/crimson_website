// @ts-nocheck
export default (req, res, next) => {
  // Extract tenant information from headers, preserving existing auth settings if present
  req.tenantId = req.tenantId || req.headers['x-tenant-id'] || 'default-tenant';
  req.userId = req.userId || req.headers['x-user-id'] || 'system';
  req.userRole = req.userRole || req.headers['x-user-role'] || 'Admin'; // Admin is default role
  next();
};
