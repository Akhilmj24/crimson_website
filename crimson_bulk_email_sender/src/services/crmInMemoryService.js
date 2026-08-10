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
const inMemoryOrders = [];
const inMemoryPayments = [];
const inMemoryExpenses = [];

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
      dealStages: ['New', 'Contacted', 'Proposal Sent', 'Follow Up', 'Negotiation', 'Order Confirmed', 'Lost', 'Closed'],
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
  const status = data.status || 'New';
  const lead = {
    _id: id,
    ...data,
    address: data.address || '',
    status,
    statusHistory: [{ status, updatedBy: userId || 'system', createdAt: new Date() }],
    quotation: data.quotation || { products: [], totalAmount: 0, expectedDeliveryDate: null, notes: '' },
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

  // Track status history
  if (data.status && data.status !== oldStatus) {
    if (!lead.statusHistory) lead.statusHistory = [];
    lead.statusHistory.push({
      status: data.status,
      updatedBy: userId || 'system',
      createdAt: new Date()
    });
  }

  const becameConfirmed = data.status === 'Order Confirmed' && oldStatus !== 'Order Confirmed';

  Object.assign(lead, data, { updatedAt: new Date() });

  if (data.status && data.status !== oldStatus) {
    logActivity(tenantId, 'STATUS_CHANGE', 'Lead', id, `Status updated to ${data.status}`, userId);
  } else {
    logActivity(tenantId, 'UPDATE', 'Lead', id, `Lead updated`, userId);
  }

  if (data.assignedUser && data.assignedUser !== oldAssigned) {
    notifyUser(tenantId, data.assignedUser, `Lead assigned: ${lead.name}`);
  }

  if (becameConfirmed) {
    await createOrderFromLeadInMemory(tenantId, lead, userId);
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
  if (data.stage === 'Won') {
    const dealName = data.name || '';
    const orderMatch = dealName.match(/ORD-\d+/i);
    let order = null;
    if (orderMatch) {
      order = inMemoryOrders.find(o => o.tenantId === tenantId && !o.isDeleted && o.orderNumber?.toUpperCase() === orderMatch[0].toUpperCase());
    } else if (data.customer) {
      order = inMemoryOrders.find(o => o.tenantId === tenantId && !o.isDeleted && o.leadId === data.customer);
    }

    if (order) {
      const payments = inMemoryPayments.filter(p => p.orderId === order._id && p.tenantId === tenantId);
      const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      if (order.paymentStatus !== 'Paid' && totalPaid < (order.totalAmount || 0) - 0.01) {
        throw new Error(`Cannot create deal in "Won" stage because payment is not completed. (Paid: ₹${totalPaid.toFixed(2)} / Grand Total: ₹${(order.totalAmount || 0).toFixed(2)})`);
      }
    }
  }

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

  if (data.stage === 'Won' && deal.stage !== 'Won') {
    const dealName = data.name || deal.name || '';
    const orderMatch = dealName.match(/ORD-\d+/i);
    let order = null;
    if (orderMatch) {
      order = inMemoryOrders.find(o => o.tenantId === tenantId && !o.isDeleted && o.orderNumber?.toUpperCase() === orderMatch[0].toUpperCase());
    } else if (deal.customer) {
      order = inMemoryOrders.find(o => o.tenantId === tenantId && !o.isDeleted && o.leadId === deal.customer);
    }

    if (order) {
      const payments = inMemoryPayments.filter(p => p.orderId === order._id && p.tenantId === tenantId);
      const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      if (order.paymentStatus !== 'Paid' && totalPaid < (order.totalAmount || 0) - 0.01) {
        throw new Error(`Cannot move deal to "Won" stage because payment is not completed. (Paid: ₹${totalPaid.toFixed(2)} / Grand Total: ₹${(order.totalAmount || 0).toFixed(2)})`);
      }
    }
  }

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

// Order from Lead Helper
const createOrderFromLeadInMemory = async (tenantId, lead, userId) => {
  const orderNumber = 'ORD-' + (1000 + inMemoryOrders.length + 1);
  const products = lead.quotation?.products || [];
  const totalAmount = lead.quotation?.totalAmount || 0;
  const expectedDeliveryDate = lead.quotation?.expectedDeliveryDate || null;
  const notes = lead.quotation?.notes || '';

  const order = {
    _id: 'ord_mem_' + Date.now(),
    leadId: lead._id,
    orderNumber,
    customerSalutation: lead.salutation || '',
    customerName: lead.name,
    companyName: lead.company || '',
    email: lead.email || '',
    phone: lead.phone || '',
    status: 'Pending',
    products,
    totalAmount,
    expectedDeliveryDate,
    paymentStatus: 'Unpaid',
    notes,
    attachments: [],
    statusHistory: [{ status: 'Pending', updatedBy: userId || 'system', notes: 'Order automatically created from Lead', createdAt: new Date() }],
    tenantId,
    isDeleted: false,
    createdBy: userId || 'system',
    updatedBy: userId || 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  inMemoryOrders.push(order);
  logActivity(tenantId, 'CREATE', 'Order', order._id, `Order ${orderNumber} created from Lead ${lead.name}`, userId);

  // Automatically create in-memory Deal card
  const deal = {
    _id: 'deal_mem_' + Date.now(),
    name: `${lead.name} - Order ${orderNumber}`,
    customer: lead._id,
    customerModel: 'Lead',
    value: totalAmount,
    products,
    closingDate: expectedDeliveryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    stage: 'New',
    assignedUser: lead.assignedUser || '',
    tenantId,
    isDeleted: false,
    createdBy: userId || 'system',
    updatedBy: userId || 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  inMemoryDeals.push(deal);
  logActivity(tenantId, 'CREATE', 'Deal', deal._id, `Deal ${deal.name} automatically created from Order ${orderNumber}`, userId);

  return order;
};

const createOrderFromLead = async (tenantId, leadId, userId) => {
  const lead = inMemoryLeads.find(l => l._id === leadId && l.tenantId === tenantId && !l.isDeleted);
  if (!lead) throw new Error('Lead not found');
  return createOrderFromLeadInMemory(tenantId, lead, userId);
};

// Orders
const getOrders = async (tenantId, query = {}) => {
  let filtered = inMemoryOrders.filter(o => o.tenantId === tenantId && !o.isDeleted);
  if (query.status) filtered = filtered.filter(o => o.status === query.status);
  if (query.paymentStatus) filtered = filtered.filter(o => o.paymentStatus === query.paymentStatus);
  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(o =>
      o.customerName.toLowerCase().includes(s) ||
      (o.companyName && o.companyName.toLowerCase().includes(s)) ||
      o.orderNumber.toLowerCase().includes(s)
    );
  }
  return filtered;
};

const getOrder = async (id, tenantId) => {
  return inMemoryOrders.find(o => o._id === id && o.tenantId === tenantId && !o.isDeleted) || null;
};

const createOrder = async (tenantId, data, userId) => {
  const orderNumber = 'ORD-' + (1000 + inMemoryOrders.length + 1);
  const order = {
    _id: 'ord_mem_' + Date.now(),
    orderNumber,
    ...data,
    status: data.status || 'Pending',
    paymentStatus: data.paymentStatus || 'Unpaid',
    statusHistory: [{ status: data.status || 'Pending', updatedBy: userId || 'system', notes: 'Order created manually', createdAt: new Date() }],
    tenantId,
    isDeleted: false,
    createdBy: userId || 'system',
    updatedBy: userId || 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  inMemoryOrders.push(order);
  logActivity(tenantId, 'CREATE', 'Order', order._id, `Order ${orderNumber} created`, userId);

  if (order.leadId) {
    const deal = {
      _id: 'deal_mem_' + Date.now() + '_manual',
      name: `${order.customerName} - Order ${orderNumber}`,
      customer: order.leadId,
      customerModel: 'Lead',
      value: order.totalAmount,
      products: order.products || [],
      closingDate: order.expectedDeliveryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      stage: 'New',
      assignedUser: order.createdBy || 'system',
      tenantId,
      isDeleted: false,
      createdBy: userId || 'system',
      updatedBy: userId || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryDeals.push(deal);
    logActivity(tenantId, 'CREATE', 'Deal', deal._id, `Deal ${deal.name} automatically created from manually created Order ${orderNumber}`, userId);
  }

  return order;
};

const updateOrder = async (id, tenantId, data, userId) => {
  const order = await getOrder(id, tenantId);
  if (!order) return null;

  if (data.status === 'Completed') {
    const payments = inMemoryPayments.filter(p => p.orderId === id && p.tenantId === tenantId);
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    if (totalPaid < order.totalAmount - 0.01) {
      throw new Error(`Cannot mark order as Completed. Payment is not fully received. (Paid: ₹${totalPaid.toFixed(2)} / Grand Total: ₹${order.totalAmount.toFixed(2)})`);
    }
  }

  const oldStatus = order.status;

  Object.assign(order, data, { updatedAt: new Date() });

  if (data.status && data.status !== oldStatus) {
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: data.status,
      updatedBy: userId || 'system',
      notes: data.statusNotes || 'Status updated',
      createdAt: new Date()
    });
    logActivity(tenantId, 'STATUS_CHANGE', 'Order', id, `Order status updated to ${data.status}`, userId);

    if (data.status === 'Completed') {
      inMemoryDeals.forEach(d => {
        if (d.tenantId === tenantId && !d.isDeleted && (d.name?.includes(order.orderNumber) || (order.leadId && d.customer === order.leadId))) {
          d.stage = 'Won';
          d.updatedAt = new Date();
          logActivity(tenantId, 'STAGE_CHANGE', 'Deal', d._id, `Deal "${d.name}" automatically moved to Won because Order ${order.orderNumber} is Completed`, userId);
        }
      });
    } else if (data.status === 'Cancelled') {
      inMemoryDeals.forEach(d => {
        if (d.tenantId === tenantId && !d.isDeleted && (d.name?.includes(order.orderNumber) || (order.leadId && d.customer === order.leadId))) {
          d.stage = 'Lost';
          d.updatedAt = new Date();
          logActivity(tenantId, 'STAGE_CHANGE', 'Deal', d._id, `Deal "${d.name}" automatically moved to Lost because Order ${order.orderNumber} is Cancelled`, userId);
        }
      });
    }
  }

  return order;
};

const deleteOrder = async (id, tenantId, userId) => {
  const order = await getOrder(id, tenantId);
  if (!order) return false;
  order.isDeleted = true;
  logActivity(tenantId, 'DELETE', 'Order', id, `Order ${order.orderNumber} soft-deleted`, userId);
  return true;
};

// Payments
const getPayments = async (tenantId, query = {}) => {
  let filtered = inMemoryPayments.filter(p => p.tenantId === tenantId);
  if (query.orderId) filtered = filtered.filter(p => p.orderId === query.orderId);
  return filtered;
};

const createPayment = async (tenantId, data, userId) => {
  const payment = {
    _id: 'pay_mem_' + Date.now(),
    ...data,
    amount: Number(data.amount) || 0,
    paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
    tenantId,
    createdBy: userId || 'system',
    createdAt: new Date()
  };
  inMemoryPayments.push(payment);

  // Update order outstanding balance and paymentStatus
  const order = await getOrder(data.orderId, tenantId);
  if (order) {
    const orderPayments = inMemoryPayments.filter(p => p.orderId === data.orderId && p.tenantId === tenantId);
    const totalPaid = orderPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = order.totalAmount - totalPaid;

    if (balance <= 0) {
      order.paymentStatus = 'Paid';
    } else if (totalPaid > 0) {
      order.paymentStatus = 'Partially Paid';
    } else {
      order.paymentStatus = 'Unpaid';
    }
    order.updatedAt = new Date();
  }

  logActivity(tenantId, 'PAYMENT', 'Order', data.orderId, `Recorded payment of ${data.amount} for Order`, userId);
  return payment;
};

// Expenses
const getExpenses = async (tenantId, query = {}) => {
  let filtered = inMemoryExpenses.filter(e => e.tenantId === tenantId && !e.isDeleted);
  if (query.category) filtered = filtered.filter(e => e.category === query.category);
  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(e =>
      e.description.toLowerCase().includes(s) ||
      (e.title && e.title.toLowerCase().includes(s))
    );
  }
  return filtered;
};

const createExpense = async (tenantId, data, userId) => {
  const expense = {
    _id: 'exp_mem_' + Date.now(),
    ...data,
    amount: Number(data.amount) || 0,
    date: data.date ? new Date(data.date) : new Date(),
    tenantId,
    isDeleted: false,
    createdBy: userId || 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  inMemoryExpenses.push(expense);
  logActivity(tenantId, 'CREATE', 'Expense', expense._id, `Expense of ${expense.amount} under ${expense.category} created`, userId);
  return expense;
};

const updateExpense = async (id, tenantId, data, userId) => {
  const exp = inMemoryExpenses.find(e => e._id === id && e.tenantId === tenantId && !e.isDeleted);
  if (!exp) return null;
  Object.assign(exp, data, { updatedAt: new Date() });
  logActivity(tenantId, 'UPDATE', 'Expense', id, `Expense updated`, userId);
  return exp;
};

const deleteExpense = async (id, tenantId, userId) => {
  const exp = inMemoryExpenses.find(e => e._id === id && e.tenantId === tenantId && !e.isDeleted);
  if (!exp) return false;
  exp.isDeleted = true;
  logActivity(tenantId, 'DELETE', 'Expense', id, `Expense deleted`, userId);
  return true;
};

// Dashboards & Reports
const getDashboardStats = async (tenantId) => {
  const leads = inMemoryLeads.filter(l => l.tenantId === tenantId && !l.isDeleted);
  const deals = inMemoryDeals.filter(d => d.tenantId === tenantId && !d.isDeleted);
  const tasks = inMemoryTasks.filter(t => t.tenantId === tenantId && !t.isDeleted);
  const followUps = inMemoryFollowUps.filter(f => f.tenantId === tenantId && !f.isDeleted);
  const orders = inMemoryOrders.filter(o => o.tenantId === tenantId && !o.isDeleted);
  const payments = inMemoryPayments.filter(p => p.tenantId === tenantId);
  const expenses = inMemoryExpenses.filter(e => e.tenantId === tenantId && !e.isDeleted);

  const totalValue = deals.filter(d => d.stage !== 'Lost').reduce((acc, d) => acc + (Number(d.value) || 0), 0);
  const openDeals = deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = totalTasks - completedTasks;

  // Calculate Lead Metrics
  const leadMetrics = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'New').length,
    contactedLeads: leads.filter(l => l.status === 'Contacted').length,
    proposalSentLeads: leads.filter(l => l.status === 'Proposal Sent').length,
    convertedLeads: leads.filter(l => l.status === 'Order Confirmed').length,
    lostLeads: leads.filter(l => l.status === 'Lost').length
  };

  // Calculate Order Metrics
  const orderMetrics = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'Pending').length,
    processingOrders: orders.filter(o => o.status === 'Processing').length,
    completedOrders: orders.filter(o => o.status === 'Completed').length
  };

  // Calculate Financial Metrics
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Outstanding payments across all non-cancelled orders
  let outstandingPayments = 0;
  orders.filter(o => o.status !== 'Cancelled').forEach(o => {
    const orderPayments = payments.filter(p => p.orderId === o._id);
    const paid = orderPayments.reduce((sum, p) => sum + p.amount, 0);
    outstandingPayments += Math.max(0, o.totalAmount - paid);
  });

  const financialMetrics = {
    totalRevenue,
    totalExpenses,
    netProfit,
    outstandingPayments
  };

  const logs = inMemoryActivityLogs.filter(a => a.tenantId === tenantId).sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);

  return {
    kpis: {
      totalLeads: leads.length,
      revenuePipeline: totalValue,
      openDeals,
      pendingTasks
    },
    leadMetrics,
    orderMetrics,
    financialMetrics,
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
  getReportsStats: getReports,

  getOrders,
  getOrderById: getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  createOrderFromLead,

  getPayments,
  createPayment,

  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
};
