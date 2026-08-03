const crmService = require('../services/crmService');
const catchAsync = require('../utils/catchAsync');

// ==========================================
// 1. Dashboard & Reports
// ==========================================
const getDashboardStats = catchAsync(async (req, res, next) => {
  const stats = await crmService.getDashboardStats(req.tenantId);
  res.json(stats);
});

const getReportsStats = catchAsync(async (req, res, next) => {
  const stats = await crmService.getReportsStats(req.tenantId);
  res.json(stats);
});

// ==========================================
// 2. Settings
// ==========================================
const getSettings = catchAsync(async (req, res, next) => {
  const settings = await crmService.getSettings(req.tenantId);
  res.json(settings);
});

const updateSettings = catchAsync(async (req, res, next) => {
  const settings = await crmService.updateSettings(req.tenantId, req.body);
  res.json(settings);
});

// ==========================================
// 3. Leads
// ==========================================
const getLeads = catchAsync(async (req, res, next) => {
  const result = await crmService.getLeads(req.tenantId, req.query);
  res.json(result);
});

const getLead = catchAsync(async (req, res, next) => {
  const lead = await crmService.getLeadById(req.tenantId, req.params.id);
  res.json(lead);
});

const createLead = catchAsync(async (req, res, next) => {
  const lead = await crmService.createLead(req.tenantId, req.body, req.userId);
  res.status(201).json(lead);
});

const updateLead = catchAsync(async (req, res, next) => {
  const lead = await crmService.updateLead(req.tenantId, req.params.id, req.body, req.userId);
  res.json(lead);
});

const deleteLead = catchAsync(async (req, res, next) => {
  await crmService.deleteLead(req.tenantId, req.params.id, req.userId);
  res.json({ success: true, message: 'Lead soft-deleted successfully' });
});

// ==========================================
// 4. Contacts
// ==========================================
const getContacts = catchAsync(async (req, res, next) => {
  const result = await crmService.getContacts(req.tenantId, req.query);
  res.json(result);
});

const getContact = catchAsync(async (req, res, next) => {
  const contact = await crmService.getContactById(req.tenantId, req.params.id);
  res.json(contact);
});

const createContact = catchAsync(async (req, res, next) => {
  const contact = await crmService.createContact(req.tenantId, req.body, req.userId);
  res.status(201).json(contact);
});

const updateContact = catchAsync(async (req, res, next) => {
  const contact = await crmService.updateContact(req.tenantId, req.params.id, req.body, req.userId);
  res.json(contact);
});

const deleteContact = catchAsync(async (req, res, next) => {
  await crmService.deleteContact(req.tenantId, req.params.id, req.userId);
  res.json({ success: true, message: 'Contact deleted successfully' });
});

// ==========================================
// 5. Companies
// ==========================================
const getCompanies = catchAsync(async (req, res, next) => {
  const result = await crmService.getCompanies(req.tenantId, req.query);
  res.json(result);
});

const getCompany = catchAsync(async (req, res, next) => {
  const company = await crmService.getCompanyById(req.tenantId, req.params.id);
  res.json(company);
});

const createCompany = catchAsync(async (req, res, next) => {
  const company = await crmService.createCompany(req.tenantId, req.body, req.userId);
  res.status(201).json(company);
});

const updateCompany = catchAsync(async (req, res, next) => {
  const company = await crmService.updateCompany(req.tenantId, req.params.id, req.body, req.userId);
  res.json(company);
});

const deleteCompany = catchAsync(async (req, res, next) => {
  await crmService.deleteCompany(req.tenantId, req.params.id, req.userId);
  res.json({ success: true, message: 'Company deleted successfully' });
});

// ==========================================
// 6. Deals
// ==========================================
const getDeals = catchAsync(async (req, res, next) => {
  const deals = await crmService.getDeals(req.tenantId, req.query);
  res.json(deals);
});

const getDeal = catchAsync(async (req, res, next) => {
  const deal = await crmService.getDealById(req.tenantId, req.params.id);
  res.json(deal);
});

const createDeal = catchAsync(async (req, res, next) => {
  const deal = await crmService.createDeal(req.tenantId, req.body, req.userId);
  res.status(201).json(deal);
});

const updateDeal = catchAsync(async (req, res, next) => {
  const deal = await crmService.updateDeal(req.tenantId, req.params.id, req.body, req.userId);
  res.json(deal);
});

const deleteDeal = catchAsync(async (req, res, next) => {
  await crmService.deleteDeal(req.tenantId, req.params.id, req.userId);
  res.json({ success: true, message: 'Deal deleted successfully' });
});

// ==========================================
// 7. Tasks
// ==========================================
const getTasks = catchAsync(async (req, res, next) => {
  const tasks = await crmService.getTasks(req.tenantId, req.query);
  res.json(tasks);
});

const getTask = catchAsync(async (req, res, next) => {
  const task = await crmService.getTaskById(req.tenantId, req.params.id);
  res.json(task);
});

const createTask = catchAsync(async (req, res, next) => {
  const task = await crmService.createTask(req.tenantId, req.body, req.userId);
  res.status(201).json(task);
});

const updateTask = catchAsync(async (req, res, next) => {
  const task = await crmService.updateTask(req.tenantId, req.params.id, req.body, req.userId);
  res.json(task);
});

const deleteTask = catchAsync(async (req, res, next) => {
  await crmService.deleteTask(req.tenantId, req.params.id, req.userId);
  res.json({ success: true, message: 'Task deleted successfully' });
});

// ==========================================
// 8. Follow Ups
// ==========================================
const getFollowUps = catchAsync(async (req, res, next) => {
  const followUps = await crmService.getFollowUps(req.tenantId, req.query);
  res.json(followUps);
});

const getFollowUp = catchAsync(async (req, res, next) => {
  const followUp = await crmService.getFollowUpById(req.tenantId, req.params.id);
  res.json(followUp);
});

const createFollowUp = catchAsync(async (req, res, next) => {
  const followUp = await crmService.createFollowUp(req.tenantId, req.body, req.userId);
  res.status(201).json(followUp);
});

const updateFollowUp = catchAsync(async (req, res, next) => {
  const followUp = await crmService.updateFollowUp(req.tenantId, req.params.id, req.body, req.userId);
  res.json(followUp);
});

const deleteFollowUp = catchAsync(async (req, res, next) => {
  await crmService.deleteFollowUp(req.tenantId, req.params.id, req.userId);
  res.json({ success: true, message: 'Follow up deleted successfully' });
});

// ==========================================
// 9. Activities
// ==========================================
const getActivities = catchAsync(async (req, res, next) => {
  const activities = await crmService.getActivities(req.tenantId, req.query);
  res.json(activities);
});

const createActivity = catchAsync(async (req, res, next) => {
  const activity = await crmService.createActivity(req.tenantId, req.body, req.userId);
  res.status(201).json(activity);
});

// ==========================================
// 10. Notifications
// ==========================================
const getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await crmService.getNotifications(req.tenantId, req.query.user || req.userId);
  res.json(notifications);
});

const markNotificationRead = catchAsync(async (req, res, next) => {
  const notification = await crmService.markNotificationRead(req.tenantId, req.params.id);
  res.json(notification);
});

module.exports = {
  getDashboardStats,
  getReportsStats,
  getSettings,
  updateSettings,
  
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  
  getDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  
  getFollowUps,
  getFollowUp,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
  
  getActivities,
  createActivity,
  
  getNotifications,
  markNotificationRead
};
