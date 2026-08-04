const AppError = require('../utils/AppError');

// Define permission mapping for each role
const rolePermissions = {
  super_admin: {
    '*': ['view', 'create', 'edit', 'delete'] // super_admin gets all permissions
  },
  Admin: {
    '*': ['view', 'create', 'edit', 'delete'] // Admin gets all permissions
  },
  Manager: {
    'crm.dashboard': ['view'],
    'crm.leads': ['view', 'create', 'edit', 'delete'],
    'crm.contacts': ['view', 'create', 'edit', 'delete'],
    'crm.companies': ['view', 'create', 'edit', 'delete'],
    'crm.deals': ['view', 'create', 'edit', 'delete'],
    'crm.tasks': ['view', 'create', 'edit', 'delete'],
    'crm.activities': ['view', 'create', 'edit', 'delete'],
    'crm.reports': ['view'],
    'crm.settings': ['view', 'edit'],
    'crm.orders': ['view', 'create', 'edit', 'delete'],
    'crm.accounts': ['view', 'create', 'edit'],
    'crm.expenses': ['view', 'create', 'edit', 'delete']
  },
  Agent: {
    'crm.dashboard': ['view'],
    'crm.leads': ['view', 'create', 'edit'],
    'crm.contacts': ['view', 'create', 'edit'],
    'crm.companies': ['view'],
    'crm.deals': ['view', 'create', 'edit'],
    'crm.tasks': ['view', 'create', 'edit'],
    'crm.activities': ['view', 'create', 'edit'],
    'crm.reports': [],
    'crm.settings': [],
    'crm.orders': ['view', 'create', 'edit'],
    'crm.accounts': ['view'],
    'crm.expenses': ['view', 'create']
  }
};

const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const role = req.userRole || 'Agent';
    
    // Check if role exists
    const permissions = rolePermissions[role];
    if (!permissions) {
      return next(new AppError('Forbidden: Access denied (invalid role)', 403));
    }

    // Admin has superuser override
    if (permissions['*'] && permissions['*'].includes(action)) {
      return next();
    }

    // Check specific resource permission
    const allowedActions = permissions[resource];
    if (allowedActions && allowedActions.includes(action)) {
      return next();
    }

    return next(new AppError(`Forbidden: You do not have permission to ${action} ${resource}`, 403));
  };
};

module.exports = {
  checkPermission
};
