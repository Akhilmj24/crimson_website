// In-memory CRM database simulation for Fallback Mode
const inMemoryLeads = [];
const inMemoryContacts = [];
const inMemoryCompanies = [];
const inMemoryDeals = [];
const inMemoryTasks = [];
const inMemoryFollowUps = [];
const inMemoryActivities = [];
const inMemoryNotifications = [];
const inMemoryActivityLogs = [];
const inMemorySettingsMap = new Map();

// Helper to log audit trail
const logActivity = (tenantId, action, moduleName, referenceId, details, createdBy) => {
  inMemoryActivityLogs.push({
    _id: 'act_mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    action,
    module: moduleName,
    referenceId,
    details,
    tenantId,
    createdBy: createdBy || 'system',
    createdAt: new Date()
  });
};

// Helper to send alerts
const notifyUser = (tenantId, username, message) => {
  if (!username) return;
  inMemoryNotifications.push({
    _id: 'not_mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    user: username,
    message,
    read: false,
    tenantId,
    createdAt: new Date()
  });
};

const getSettings = async (tenantId) => {
  if (!inMemorySettingsMap.has(tenantId)) {
    inMemorySettingsMap.set(tenantId, {
      leadSources: ['Website', 'Referral', 'Social Media', 'Cold Reach', 'Other'],
      tags: ['Warm', 'Cold', 'Enterprise', 'SMB', 'Important'],
      dealStages: ['New', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'],
      customFields: [],
      tenantId
    });
  }
  return inMemorySettingsMap.get(tenantId);
};

const updateSettings = async (tenantId, data) => {
  const current = await getSettings(tenantId);
  const updated = { ...current, ...data };
  inMemorySettingsMap.set(tenantId, updated);
  return updated;
};

// Leads
const getLeads = async (tenantId, query = {}) => {
  let filtered = inMemoryLeads.filter(l => l.tenantId === tenantId && !l.isDeleted);
  if (query.status) filtered = filtered.filter(l => l.status === query.status);
  if (query.priority) filtered = filtered.filter(l => l.priority === query.priority);
  if (query.source) filtered = filtered.filter(l => l.source === query.source);
  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(l => l.name.toLowerCase().includes(s) || (l.company && l.company.toLowerCase().includes(s)));
  }
  return filtered;
};

const getLead = async (id, tenantId) => {
  return inMemoryLeads.find(l => l._id === id && l.tenantId === tenantId && !l.isDeleted) || null;
};

const createLead = async (tenantId, data, userId) => {
  const id = 'lead_mem_' + Date.now();
  const lead = {
    _id: id,
    ...data,
    tenantId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  inMemoryLeads.push(lead);
  logActivity(tenantId, 'CREATE', 'Lead', id, `Lead ${lead.name} created`, userId);
  if (lead.assignedUser) {
    notifyUser(tenantId, lead.assignedUser, `New Lead assigned: ${lead.name}`);
  }
  return lead;
};

const updateLead = async (id, tenantId, data, userId) => {
  const lead = await getLead(id, tenantId);
  if (!lead) return null;
  
  const oldStatus = lead.status;
  const oldAssigned = lead.assignedUser;

  Object.assign(lead, data, { updatedAt: new Date() });

  if (data.status && data.status !== oldStatus) {
    logActivity(tenantId, 'STATUS_CHANGE', 'Lead', id, `Status updated to ${data.status}`, userId);
  } else {
    logActivity(tenantId, 'UPDATE', 'Lead', id, `Lead updated`, userId);
  }

  if (data.assignedUser && data.assignedUser !== oldAssigned) {
    notifyUser(tenantId, data.assignedUser, `Lead assigned: ${lead.name}`);
  }

  return lead;
};

const deleteLead = async (id, tenantId, userId) => {
  const lead = await getLead(id, tenantId);
  if (!lead) return false;
  lead.isDeleted = true;
  logActivity(tenantId, 'DELETE', 'Lead', id, `Lead ${lead.name} soft-deleted`, userId);
  return true;
};

// Contacts
const getContacts = async (tenantId, query = {}) => {
  let filtered = inMemoryContacts.filter(c => c.tenantId === tenantId && !c.isDeleted);
  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(s) || (c.company && c.company.toLowerCase().includes(s)));
  }
  return filtered;
};

const getContact = async (id, tenantId) => {
  return inMemoryContacts.find(c => c._id === id && c.tenantId === tenantId && !c.isDeleted) || null;
};

const createContact = async (tenantId, data, userId) => {
  const id = 'contact_mem_' + Date.now();
  const contact = {
    _id: id,
    ...data,
    tenantId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  inMemoryContacts.push(contact);
  logActivity(tenantId, 'CREATE', 'Contact', id, `Contact ${contact.name} created`, userId);
  return contact;
};

const updateContact = async (id, tenantId, data, userId) => {
  const contact = await getContact(id, tenantId);
  if (!contact) return null;
  Object.assign(contact, data, { updatedAt: new Date() });
  logActivity(tenantId, 'UPDATE', 'Contact', id, `Contact updated`, userId);
  return contact;
};

const deleteContact = async (id, tenantId, userId) => {
  const contact = await getContact(id, tenantId);
  if (!contact) return false;
  contact.isDeleted = true;
  logActivity(tenantId, 'DELETE', 'Contact', id, `Contact ${contact.name} soft-deleted`, userId);
  return true;
};

// Companies
const getCompanies = async (tenantId, query = {}) => {
  let filtered = inMemoryCompanies.filter(c => c.tenantId === tenantId && !c.isDeleted);
  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(s) || (c.industry && c.industry.toLowerCase().includes(s)));
  }
  return filtered;
};

const getCompany = async (id, tenantId) => {
  const company = inMemoryCompanies.find(c => c._id === id && c.tenantId === tenantId && !c.isDeleted);
  if (!company) return null;
  // Populate contacts
  const contacts = inMemoryContacts.filter(c => c.company === company.name && c.tenantId === tenantId && !c.isDeleted);
  return { ...company, contacts };
};

const createCompany = async (tenantId, data, userId) => {
  const id = 'company_mem_' + Date.now();
  const company = {
    _id: id,
    ...data,
    tenantId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  inMemoryCompanies.push(company);
  logActivity(tenantId, 'CREATE', 'Company', id, `Company ${company.name} created`, userId);
  return company;
};

const updateCompany = async (id, tenantId, data, userId) => {
  const company = inMemoryCompanies.find(c => c._id === id && c.tenantId === tenantId && !c.isDeleted);
  if (!company) return null;
  Object.assign(company, data, { updatedAt: new Date() });
  logActivity(tenantId, 'UPDATE', 'Company', id, `Company updated`, userId);
  return company;
};

const deleteCompany = async (id, tenantId, userId) => {
  const company = inMemoryCompanies.find(c => c._id === id && c.tenantId === tenantId && !c.isDeleted);
  if (!company) return false;
  company.isDeleted = true;
  logActivity(tenantId, 'DELETE', 'Company', id, `Company ${company.name} soft-deleted`, userId);
  return true;
};

// Deals
const getDeals = async (tenantId, query = {}) => {
  let filtered = inMemoryDeals.filter(d => d.tenantId === tenantId && !d.isDeleted);
  if (query.stage) filtered = filtered.filter(d => d.stage === query.stage);
  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(d => d.name.toLowerCase().includes(s));
  }
  return filtered;
};

const getDeal = async (id, tenantId) => {
  const deal = inMemoryDeals.find(d => d._id === id && d.tenantId === tenantId && !d.isDeleted);
  if (!deal) return null;
  // Populate customer reference helper
  let customer = null;
  if (deal.customerModel === 'Lead') {
    customer = inMemoryLeads.find(l => l._id === deal.customerId);
  } else if (deal.customerModel === 'Contact') {
    customer = inMemoryContacts.find(c => c._id === deal.customerId);
  }
  return { ...deal, customer };
};

const createDeal = async (tenantId, data, userId) => {
  const id = 'deal_mem_' + Date.now();
  const deal = {
    _id: id,
    ...data,
    tenantId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  inMemoryDeals.push(deal);
  logActivity(tenantId, 'CREATE', 'Deal', id, `Deal ${deal.name} of value $${deal.value} created`, userId);
  if (deal.assignedUser) {
    notifyUser(tenantId, deal.assignedUser, `New Deal assigned: ${deal.name}`);
  }
  return deal;
};

const updateDeal = async (id, tenantId, data, userId) => {
  const deal = inMemoryDeals.find(d => d._id === id && d.tenantId === tenantId && !d.isDeleted);
  if (!deal) return null;

  const oldStage = deal.stage;
  const oldAssigned = deal.assignedUser;

  Object.assign(deal, data, { updatedAt: new Date() });

  if (data.stage && data.stage !== oldStage) {
    logActivity(tenantId, 'STAGE_CHANGE', 'Deal', id, `Pipeline stage changed to ${data.stage}`, userId);
    if (data.stage === 'Won') {
      notifyUser(tenantId, deal.assignedUser || userId, `🎉 Deal Won: ${deal.name} ($${deal.value})`);
    } else if (data.stage === 'Lost') {
      notifyUser(tenantId, deal.assignedUser || userId, `Deal Lost: ${deal.name}`);
    }
  } else {
    logActivity(tenantId, 'UPDATE', 'Deal', id, `Deal updated`, userId);
  }

  if (data.assignedUser && data.assignedUser !== oldAssigned) {
    notifyUser(tenantId, data.assignedUser, `Deal assigned: ${deal.name}`);
  }

  return deal;
};

const deleteDeal = async (id, tenantId, userId) => {
  const deal = inMemoryDeals.find(d => d._id === id && d.tenantId === tenantId && !d.isDeleted);
  if (!deal) return false;
  deal.isDeleted = true;
  logActivity(tenantId, 'DELETE', 'Deal', id, `Deal ${deal.name} soft-deleted`, userId);
  return true;
};

// Tasks
const getTasks = async (tenantId, query = {}) => {
  let filtered = inMemoryTasks.filter(t => t.tenantId === tenantId && !t.isDeleted);
  if (query.status) filtered = filtered.filter(t => t.status === query.status);
  if (query.priority) filtered = filtered.filter(t => t.priority === query.priority);
  return filtered;
};

const getTask = async (id, tenantId) => {
  return inMemoryTasks.find(t => t._id === id && t.tenantId === tenantId && !t.isDeleted) || null;
};

const createTask = async (tenantId, data, userId) => {
  const id = 'task_mem_' + Date.now();
  const task = {
    _id: id,
    ...data,
    tenantId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  inMemoryTasks.push(task);
  logActivity(tenantId, 'CREATE', 'Task', id, `Task "${task.title}" created`, userId);
  if (task.assignedUser) {
    notifyUser(tenantId, task.assignedUser, `New Task assigned: ${task.title}`);
  }
  return task;
};

const updateTask = async (id, tenantId, data, userId) => {
  const task = await getTask(id, tenantId);
  if (!task) return null;

  const oldStatus = task.status;
  Object.assign(task, data, { updatedAt: new Date() });

  if (data.status && data.status !== oldStatus) {
    logActivity(tenantId, 'STATUS_CHANGE', 'Task', id, `Task status set to ${data.status}`, userId);
  } else {
    logActivity(tenantId, 'UPDATE', 'Task', id, `Task updated`, userId);
  }

  return task;
};

const deleteTask = async (id, tenantId, userId) => {
  const task = await getTask(id, tenantId);
  if (!task) return false;
  task.isDeleted = true;
  logActivity(tenantId, 'DELETE', 'Task', id, `Task soft-deleted`, userId);
  return true;
};

// Follow Ups
const getFollowUps = async (tenantId, query = {}) => {
  let filtered = inMemoryFollowUps.filter(f => f.tenantId === tenantId && !f.isDeleted);
  return filtered;
};

const getFollowUp = async (id, tenantId) => {
  const followUp = inMemoryFollowUps.find(f => f._id === id && f.tenantId === tenantId && !f.isDeleted);
  if (!followUp) return null;
  let customer = null;
  if (followUp.customerModel === 'Lead') {
    customer = inMemoryLeads.find(l => l._id === followUp.customerId);
  } else if (followUp.customerModel === 'Contact') {
    customer = inMemoryContacts.find(c => c._id === followUp.customerId);
  }
  return { ...followUp, customer };
};

const createFollowUp = async (tenantId, data, userId) => {
  const id = 'follow_mem_' + Date.now();
  const followUp = {
    _id: id,
    ...data,
    tenantId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  inMemoryFollowUps.push(followUp);
  logActivity(tenantId, 'CREATE', 'FollowUp', id, `Follow Up scheduled for ${followUp.date}`, userId);
  return followUp;
};

const updateFollowUp = async (id, tenantId, data, userId) => {
  const followUp = inMemoryFollowUps.find(f => f._id === id && f.tenantId === tenantId && !f.isDeleted);
  if (!followUp) return null;
  Object.assign(followUp, data, { updatedAt: new Date() });
  logActivity(tenantId, 'UPDATE', 'FollowUp', id, `Follow Up updated`, userId);
  return followUp;
};

const deleteFollowUp = async (id, tenantId, userId) => {
  const followUp = inMemoryFollowUps.find(f => f._id === id && f.tenantId === tenantId && !f.isDeleted);
  if (!followUp) return false;
  followUp.isDeleted = true;
  logActivity(tenantId, 'DELETE', 'FollowUp', id, `Follow Up cancelled`, userId);
  return true;
};

// Activities
const getActivities = async (tenantId, query = {}) => {
  let filtered = inMemoryActivities.filter(a => a.tenantId === tenantId && !a.isDeleted);
  return filtered;
};

const createActivity = async (tenantId, data, userId) => {
  const id = 'act_mem_' + Date.now();
  const activity = {
    _id: id,
    ...data,
    tenantId,
    isDeleted: false,
    createdAt: new Date()
  };
  inMemoryActivities.push(activity);
  logActivity(tenantId, 'LOG_ACTIVITY', 'Activity', id, `Logged ${activity.type} interaction`, userId);
  return activity;
};

// Notifications
const getNotifications = async (tenantId) => {
  return inMemoryNotifications.filter(n => n.tenantId === tenantId).sort((a, b) => b.createdAt - a.createdAt);
};

const markNotificationRead = async (id, tenantId) => {
  const n = inMemoryNotifications.find(x => x._id === id && x.tenantId === tenantId);
  if (n) {
    n.read = true;
  }
  return n;
};

// Logs
const getActivityLogs = async (tenantId) => {
  return inMemoryActivityLogs.filter(a => a.tenantId === tenantId).sort((a, b) => b.createdAt - a.createdAt);
};

// Dashboards & Reports
const getDashboardStats = async (tenantId) => {
  const leads = inMemoryLeads.filter(l => l.tenantId === tenantId && !l.isDeleted);
  const deals = inMemoryDeals.filter(d => d.tenantId === tenantId && !d.isDeleted);
  const tasks = inMemoryTasks.filter(t => t.tenantId === tenantId && !t.isDeleted);
  const followUps = inMemoryFollowUps.filter(f => f.tenantId === tenantId && !f.isDeleted);

  const totalValue = deals.filter(d => d.stage !== 'Lost').reduce((acc, d) => acc + (Number(d.value) || 0), 0);
  const openDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length;
  const wonDeals = deals.filter(d => d.stage === 'Won').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;

  const logs = inMemoryActivityLogs.filter(a => a.tenantId === tenantId).sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);

  return {
    kpis: {
      totalLeads: leads.length,
      revenuePipeline: totalValue,
      openDeals,
      pendingTasks
    },
    upcomingFollowUps: followUps.slice(0, 5),
    recentLogs: logs
  };
};

const getReports = async (tenantId) => {
  const stats = await getDashboardStats(tenantId);
  const leads = inMemoryLeads.filter(l => l.tenantId === tenantId && !l.isDeleted);
  const deals = inMemoryDeals.filter(d => d.tenantId === tenantId && !d.isDeleted);

  // Conversion rate
  const converted = deals.filter(d => d.stage === 'Won').length;
  const conversionRate = leads.length > 0 ? ((converted / leads.length) * 100).toFixed(1) : 0;

  // Source split
  const sourceCount = {};
  leads.forEach(l => {
    sourceCount[l.source] = (sourceCount[l.source] || 0) + 1;
  });
  const leadSources = Object.keys(sourceCount).map(k => ({ name: k, value: sourceCount[k] }));

  // Stage split
  const stageCount = {};
  deals.forEach(d => {
    stageCount[d.stage] = (stageCount[d.stage] || 0) + 1;
  });
  const dealStages = Object.keys(stageCount).map(k => ({ name: k, value: stageCount[k] }));

  return {
    conversionRate: Number(conversionRate),
    activeDealsCount: stats.kpis.openDeals,
    revenueWon: deals.filter(d => d.stage === 'Won').reduce((acc, d) => acc + (Number(d.value) || 0), 0),
    leadSources,
    dealStages,
    teamPerformance: []
  };
};

module.exports = {
  getSettings,
  updateSettings,
  
  getLeads,
  getLeadById: getLead,
  createLead,
  updateLead,
  deleteLead,
  
  getContacts,
  getContactById: getContact,
  createContact,
  updateContact,
  deleteContact,
  
  getCompanies,
  getCompanyById: getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  
  getDeals,
  getDealById: getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
  
  getTasks,
  getTaskById: getTask,
  createTask,
  updateTask,
  deleteTask,
  
  getFollowUps,
  getFollowUpById: getFollowUp,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
  
  getActivities,
  createActivity,
  
  getNotifications,
  markNotificationRead,
  getActivityLogs,
  
  getDashboardStats,
  getReportsStats: getReports
};
