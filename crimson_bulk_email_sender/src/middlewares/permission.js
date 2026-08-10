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
    'campaign.dispatcher': ['view', 'create', 'edit', 'delete'],
    'campaign.settings': ['view', 'edit'],
    'campaign.history': ['view'],
    'docs.invoice': ['view', 'create', 'edit', 'delete'],
    'docs.proposal': ['view', 'create', 'edit', 'delete'],
    'docs.history': ['view', 'create', 'edit', 'delete'],
    'products.list': ['view', 'create', 'edit', 'delete'],
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
    'campaign.dispatcher': ['view', 'create', 'edit'],
    'campaign.settings': [],
    'campaign.history': ['view'],
    'docs.invoice': ['view', 'create', 'edit'],
    'docs.proposal': ['view', 'create', 'edit'],
    'docs.history': ['view', 'create', 'edit'],
    'products.list': ['view', 'create', 'edit'],
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
    'crm.accounts': ['view', 'create'],
    'crm.expenses': ['view', 'create']
  }
};

const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const role = req.userRole || 'Agent';
    const customPermissions = req.user?.customPermissions;
    
    // Check custom permissions first if available
    if (customPermissions) {
      // Admin/Super Admin override check in custom permissions?
      // Usually custom permissions explicitly define what is allowed.
      // We will check if custom permissions defines the resource.
      
      // Since it's a Map in Mongoose, it might be accessed via .get() or plain object.
      const getCustomPerms = (resName) => {
        if (typeof customPermissions.get === 'function') {
          return customPermissions.get(resName);
        }
        return customPermissions[resName];
      };

      const customResourcePerms = getCustomPerms(resource);
      const customAllPerms = getCustomPerms('*');

      // If they have * override
      if (customAllPerms && customAllPerms.includes(action)) {
        return next();
      }

      // If they have explicit resource override
      if (customResourcePerms) {
        if (customResourcePerms.includes(action)) {
          return next();
        } else {
           // Custom permissions are strict: if it exists but doesn't have action, DENY
          return next(new AppError(`Forbidden: Your custom permissions do not allow to ${action} ${resource}`, 403));
        }
      }
      
      // If custom permissions are configured (not empty) and the resource is NOT in it, DENY.
      if (Object.keys(customPermissions).length > 0) {
         return next(new AppError(`Forbidden: Your custom permissions do not include ${resource}`, 403));
      }
    }

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
