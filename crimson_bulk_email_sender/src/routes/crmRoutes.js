const express = require('express');
const crmController = require('../controllers/crmController');
const auth = require('../middlewares/auth');
const tenant = require('../middlewares/tenant');
const { checkPermission } = require('../middlewares/permission');
const validate = require('../middlewares/validate');
const {
  validateLead,
  validateContact,
  validateCompany,
  validateDeal,
  validateTask,
  validateFollowUp,
  validateSettings,
  validateOrder,
  validatePayment,
  validateExpense
} = require('../validators/crmValidator');

const router = express.Router();

// Apply auth and tenant middlewares to all CRM routes
router.use(auth);
router.use(tenant);

// 1. Dashboard & Reports
router.get('/crm/dashboard', checkPermission('crm.dashboard', 'view'), crmController.getDashboardStats);
router.get('/crm/reports', checkPermission('crm.reports', 'view'), crmController.getReportsStats);

// 2. Settings
router.get('/crm/settings', checkPermission('crm.settings', 'view'), crmController.getSettings);
router.put('/crm/settings', checkPermission('crm.settings', 'edit'), validate(validateSettings), crmController.updateSettings);

// 3. Leads
router.get('/crm/leads', checkPermission('crm.leads', 'view'), crmController.getLeads);
router.get('/crm/leads/:id', checkPermission('crm.leads', 'view'), crmController.getLead);
router.post('/crm/leads', checkPermission('crm.leads', 'create'), validate(validateLead), crmController.createLead);
router.put('/crm/leads/:id', checkPermission('crm.leads', 'edit'), validate(validateLead), crmController.updateLead);
router.delete('/crm/leads/:id', checkPermission('crm.leads', 'delete'), crmController.deleteLead);

// 4. Contacts
router.get('/crm/contacts', checkPermission('crm.contacts', 'view'), crmController.getContacts);
router.get('/crm/contacts/:id', checkPermission('crm.contacts', 'view'), crmController.getContact);
router.post('/crm/contacts', checkPermission('crm.contacts', 'create'), validate(validateContact), crmController.createContact);
router.put('/crm/contacts/:id', checkPermission('crm.contacts', 'edit'), validate(validateContact), crmController.updateContact);
router.delete('/crm/contacts/:id', checkPermission('crm.contacts', 'delete'), crmController.deleteContact);

// 5. Companies
router.get('/crm/companies', checkPermission('crm.companies', 'view'), crmController.getCompanies);
router.get('/crm/companies/:id', checkPermission('crm.companies', 'view'), crmController.getCompany);
router.post('/crm/companies', checkPermission('crm.companies', 'create'), validate(validateCompany), crmController.createCompany);
router.put('/crm/companies/:id', checkPermission('crm.companies', 'edit'), validate(validateCompany), crmController.updateCompany);
router.delete('/crm/companies/:id', checkPermission('crm.companies', 'delete'), crmController.deleteCompany);

// 6. Deals
router.get('/crm/deals', checkPermission('crm.deals', 'view'), crmController.getDeals);
router.get('/crm/deals/:id', checkPermission('crm.deals', 'view'), crmController.getDeal);
router.post('/crm/deals', checkPermission('crm.deals', 'create'), validate(validateDeal), crmController.createDeal);
router.put('/crm/deals/:id', checkPermission('crm.deals', 'edit'), validate(validateDeal), crmController.updateDeal);
router.delete('/crm/deals/:id', checkPermission('crm.deals', 'delete'), crmController.deleteDeal);

// 7. Tasks
router.get('/crm/tasks', checkPermission('crm.tasks', 'view'), crmController.getTasks);
router.get('/crm/tasks/:id', checkPermission('crm.tasks', 'view'), crmController.getTask);
router.post('/crm/tasks', checkPermission('crm.tasks', 'create'), validate(validateTask), crmController.createTask);
router.put('/crm/tasks/:id', checkPermission('crm.tasks', 'edit'), validate(validateTask), crmController.updateTask);
router.delete('/crm/tasks/:id', checkPermission('crm.tasks', 'delete'), crmController.deleteTask);

// 8. Follow Ups
router.get('/crm/followups', checkPermission('crm.tasks', 'view'), crmController.getFollowUps);
router.get('/crm/followups/:id', checkPermission('crm.tasks', 'view'), crmController.getFollowUp);
router.post('/crm/followups', checkPermission('crm.tasks', 'create'), validate(validateFollowUp), crmController.createFollowUp);
router.put('/crm/followups/:id', checkPermission('crm.tasks', 'edit'), validate(validateFollowUp), crmController.updateFollowUp);
router.delete('/crm/followups/:id', checkPermission('crm.tasks', 'delete'), crmController.deleteFollowUp);

// 9. Activities
router.get('/crm/activities', checkPermission('crm.activities', 'view'), crmController.getActivities);
router.post('/crm/activities', checkPermission('crm.activities', 'create'), crmController.createActivity);

// 10. Notifications
router.get('/crm/notifications', crmController.getNotifications);
router.patch('/crm/notifications/:id/read', crmController.markNotificationRead);

// 11. Orders
router.get('/crm/orders', checkPermission('crm.orders', 'view'), crmController.getOrders);
router.get('/crm/orders/:id', checkPermission('crm.orders', 'view'), crmController.getOrder);
router.post('/crm/orders', checkPermission('crm.orders', 'create'), validate(validateOrder), crmController.createOrder);
router.put('/crm/orders/:id', checkPermission('crm.orders', 'edit'), validate(validateOrder), crmController.updateOrder);
router.delete('/crm/orders/:id', checkPermission('crm.orders', 'delete'), crmController.deleteOrder);

// 12. Payments
router.get('/crm/payments', checkPermission('crm.accounts', 'view'), crmController.getPayments);
router.post('/crm/payments', checkPermission('crm.accounts', 'create'), validate(validatePayment), crmController.createPayment);

// 13. Expenses
router.get('/crm/expenses', checkPermission('crm.expenses', 'view'), crmController.getExpenses);
router.post('/crm/expenses', checkPermission('crm.expenses', 'create'), validate(validateExpense), crmController.createExpense);
router.put('/crm/expenses/:id', checkPermission('crm.expenses', 'edit'), validate(validateExpense), crmController.updateExpense);
router.delete('/crm/expenses/:id', checkPermission('crm.expenses', 'delete'), crmController.deleteExpense);

module.exports = router;
