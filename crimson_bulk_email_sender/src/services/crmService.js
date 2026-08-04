const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Company = require('../models/Company');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');
const Task = require('../models/Task');
const FollowUp = require('../models/FollowUp');
const ActivityLog = require('../models/ActivityLog');
const CrmSettings = require('../models/CrmSettings');
const Notification = require('../models/Notification');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const AppError = require('../utils/AppError');
const { isDBConnected } = require('../config/db');
const crmInMemoryService = require('./crmInMemoryService');

// Generic Activity Logger Helper
const logActivity = async (tenantId, action, moduleName, referenceId, details, createdBy) => {
  try {
    await ActivityLog.create({
      action,
      module: moduleName,
      referenceId,
      details,
      tenantId,
      createdBy
    });
  } catch (err) {
    console.error('Failed to log system activity:', err.message);
  }
};

// Generic Notification Logger Helper
const notifyUser = async (tenantId, username, message) => {
  if (!username) return;
  try {
    await Notification.create({
      user: username,
      message,
      tenantId
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

// ==========================================
// 1. Settings Service
// ==========================================
const getSettings = async (tenantId) => {
  let settings = await CrmSettings.findOne({ tenantId });
  if (!settings) {
    settings = new CrmSettings({ tenantId });
    await settings.save();
  }
  return settings;
};

const updateSettings = async (tenantId, data) => {
  const settings = await CrmSettings.findOneAndUpdate(
    { tenantId },
    { $set: data },
    { new: true, upsert: true, runValidators: true }
  );
  return settings;
};

// ==========================================
// 2. Leads Service
// ==========================================
const getLeads = async (tenantId, queryParams = {}) => {
  const { search, status, priority, page = 1, limit = 50 } = queryParams;
  const filter = { tenantId, isDeleted: false };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Lead.countDocuments(filter);
  const data = await Lead.find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return { data, total, page: parseInt(page), limit: parseInt(limit) };
};

const getLeadById = async (tenantId, id) => {
  const lead = await Lead.findOne({ _id: id, tenantId, isDeleted: false });
  if (!lead) throw new AppError('Lead not found', 404);
  return lead;
};

const createLead = async (tenantId, data, createdBy) => {
  const status = data.status || 'New';
  const lead = new Lead({
    ...data,
    tenantId,
    createdBy,
    updatedBy: createdBy,
    statusHistory: [{ status, updatedBy: createdBy }]
  });
  await lead.save();

  await logActivity(tenantId, 'CREATE', 'leads', lead._id, `Lead "${lead.name}" created`, createdBy);

  if (lead.assignedUser) {
    await notifyUser(tenantId, lead.assignedUser, `New Lead Assigned: ${lead.name}`);
  }

  return lead;
};

const updateLead = async (tenantId, id, data, updatedBy) => {
  const oldLead = await Lead.findOne({ _id: id, tenantId, isDeleted: false });
  if (!oldLead) throw new AppError('Lead not found', 404);

  const statusChanged = data.status && data.status !== oldLead.status;
  const becameConfirmed = data.status === 'Order Confirmed' && oldLead.status !== 'Order Confirmed';

  let updateQuery = { $set: { ...data, updatedBy } };
  if (statusChanged) {
    updateQuery.$push = {
      statusHistory: { status: data.status, updatedBy }
    };
  }

  const lead = await Lead.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    updateQuery,
    { new: true, runValidators: true }
  );

  let details = `Lead "${lead.name}" updated`;
  let action = 'UPDATE';

  if (statusChanged) {
    action = 'STAGE_CHANGE';
    details = `Lead status changed from "${oldLead.status}" to "${lead.status}"`;
  }

  if (oldLead.assignedUser !== lead.assignedUser) {
    action = 'ASSIGNMENT_CHANGE';
    details = `Lead assignment changed from "${oldLead.assignedUser || 'None'}" to "${lead.assignedUser || 'None'}"`;
    if (lead.assignedUser) {
      await notifyUser(tenantId, lead.assignedUser, `Lead Assigned: ${lead.name}`);
    }
  }

  await logActivity(tenantId, action, 'leads', lead._id, details, updatedBy);

  if (becameConfirmed) {
    await createOrderFromLeadDB(tenantId, lead, updatedBy);
  }

  return lead;
};

const deleteLead = async (tenantId, id, updatedBy) => {
  const lead = await Lead.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { isDeleted: true, updatedBy },
    { new: true }
  );
  if (!lead) throw new AppError('Lead not found', 404);

  await logActivity(tenantId, 'DELETE', 'leads', lead._id, `Lead "${lead.name}" deleted (soft delete)`, updatedBy);
  return lead;
};

// ==========================================
// 3. Contacts Service
// ==========================================
const getContacts = async (tenantId, queryParams = {}) => {
  const { search, page = 1, limit = 50 } = queryParams;
  const filter = { tenantId, isDeleted: false };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Contact.countDocuments(filter);
  const data = await Contact.find(filter)
    .sort({ name: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  return { data, total, page: parseInt(page), limit: parseInt(limit) };
};

const getContactById = async (tenantId, id) => {
  const contact = await Contact.findOne({ _id: id, tenantId, isDeleted: false });
  if (!contact) throw new AppError('Contact not found', 404);
  return contact;
};

const createContact = async (tenantId, data, createdBy) => {
  const contact = new Contact({ ...data, tenantId, createdBy, updatedBy: createdBy });
  await contact.save();
  await logActivity(tenantId, 'CREATE', 'contacts', contact._id, `Contact "${contact.name}" created`, createdBy);
  return contact;
};

const updateContact = async (tenantId, id, data, updatedBy) => {
  const contact = await Contact.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { ...data, updatedBy },
    { new: true, runValidators: true }
  );
  if (!contact) throw new AppError('Contact not found', 404);

  await logActivity(tenantId, 'UPDATE', 'contacts', contact._id, `Contact "${contact.name}" updated`, updatedBy);
  return contact;
};

const deleteContact = async (tenantId, id, updatedBy) => {
  const contact = await Contact.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { isDeleted: true, updatedBy },
    { new: true }
  );
  if (!contact) throw new AppError('Contact not found', 404);

  await logActivity(tenantId, 'DELETE', 'contacts', contact._id, `Contact "${contact.name}" deleted`, updatedBy);
  return contact;
};

// ==========================================
// 4. Companies Service
// ==========================================
const getCompanies = async (tenantId, queryParams = {}) => {
  const { search, page = 1, limit = 50 } = queryParams;
  const filter = { tenantId, isDeleted: false };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { industry: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Company.countDocuments(filter);
  const data = await Company.find(filter)
    .populate('contacts')
    .sort({ name: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  return { data, total, page: parseInt(page), limit: parseInt(limit) };
};

const getCompanyById = async (tenantId, id) => {
  const company = await Company.findOne({ _id: id, tenantId, isDeleted: false }).populate('contacts');
  if (!company) throw new AppError('Company not found', 404);
  return company;
};

const createCompany = async (tenantId, data, createdBy) => {
  const company = new Company({ ...data, tenantId, createdBy, updatedBy: createdBy });
  await company.save();
  await logActivity(tenantId, 'CREATE', 'companies', company._id, `Company "${company.name}" created`, createdBy);
  return company;
};

const updateCompany = async (tenantId, id, data, updatedBy) => {
  const company = await Company.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { ...data, updatedBy },
    { new: true, runValidators: true }
  );
  if (!company) throw new AppError('Company not found', 404);

  await logActivity(tenantId, 'UPDATE', 'companies', company._id, `Company "${company.name}" updated`, updatedBy);
  return company;
};

const deleteCompany = async (tenantId, id, updatedBy) => {
  const company = await Company.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { isDeleted: true, updatedBy },
    { new: true }
  );
  if (!company) throw new AppError('Company not found', 404);

  await logActivity(tenantId, 'DELETE', 'companies', company._id, `Company "${company.name}" deleted`, updatedBy);
  return company;
};

// ==========================================
// 5. Deals Service
// ==========================================
const getDeals = async (tenantId, filters = {}) => {
  const filter = { tenantId, isDeleted: false };
  if (filters.stage) filter.stage = filters.stage;
  if (filters.assignedUser) filter.assignedUser = filters.assignedUser;

  return await Deal.find(filter)
    .populate('customer')
    .sort({ updatedAt: -1 });
};

const getDealById = async (tenantId, id) => {
  const deal = await Deal.findOne({ _id: id, tenantId, isDeleted: false }).populate('customer');
  if (!deal) throw new AppError('Deal not found', 404);
  return deal;
};

const createDeal = async (tenantId, data, createdBy) => {
  const deal = new Deal({ ...data, tenantId, createdBy, updatedBy: createdBy });
  await deal.save();

  await logActivity(tenantId, 'CREATE', 'deals', deal._id, `Deal "${deal.name}" worth ₹${deal.value} created`, createdBy);

  if (deal.assignedUser) {
    await notifyUser(tenantId, deal.assignedUser, `New Deal Assigned: ${deal.name}`);
  }

  return deal;
};

const updateDeal = async (tenantId, id, data, updatedBy) => {
  const oldDeal = await Deal.findOne({ _id: id, tenantId, isDeleted: false });
  if (!oldDeal) throw new AppError('Deal not found', 404);

  const deal = await Deal.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { ...data, updatedBy },
    { new: true, runValidators: true }
  ).populate('customer');

  let details = `Deal "${deal.name}" updated`;
  let action = 'UPDATE';

  if (oldDeal.stage !== deal.stage) {
    action = 'STAGE_CHANGE';
    details = `Deal "${deal.name}" stage changed from "${oldDeal.stage}" to "${deal.stage}"`;

    if (deal.stage === 'Won') {
      await notifyUser(tenantId, deal.assignedUser || updatedBy, `Deal Won! 🎉: ${deal.name} (Value: ₹${deal.value})`);
    } else if (deal.stage === 'Lost') {
      await notifyUser(tenantId, deal.assignedUser || updatedBy, `Deal Lost 😞: ${deal.name}`);
    }
  }

  if (oldDeal.assignedUser !== deal.assignedUser) {
    action = 'ASSIGNMENT_CHANGE';
    details = `Deal "${deal.name}" assigned to "${deal.assignedUser || 'None'}"`;
    if (deal.assignedUser) {
      await notifyUser(tenantId, deal.assignedUser, `Deal Assigned: ${deal.name}`);
    }
  }

  await logActivity(tenantId, action, 'deals', deal._id, details, updatedBy);
  return deal;
};

const deleteDeal = async (tenantId, id, updatedBy) => {
  const deal = await Deal.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { isDeleted: true, updatedBy },
    { new: true }
  );
  if (!deal) throw new AppError('Deal not found', 404);

  await logActivity(tenantId, 'DELETE', 'deals', deal._id, `Deal "${deal.name}" deleted`, updatedBy);
  return deal;
};

// ==========================================
// 6. Tasks Service
// ==========================================
const getTasks = async (tenantId, filters = {}) => {
  const filter = { tenantId, isDeleted: false };
  if (filters.status) filter.status = filters.status;
  if (filters.priority) filter.priority = filters.priority;
  if (filters.assignedUser) filter.assignedUser = filters.assignedUser;

  return await Task.find(filter).sort({ dueDate: 1 });
};

const getTaskById = async (tenantId, id) => {
  const task = await Task.findOne({ _id: id, tenantId, isDeleted: false });
  if (!task) throw new AppError('Task not found', 404);
  return task;
};

const createTask = async (tenantId, data, createdBy) => {
  const task = new Task({ ...data, tenantId, createdBy, updatedBy: createdBy });
  await task.save();

  await logActivity(tenantId, 'CREATE', 'tasks', task._id, `Task "${task.title}" created`, createdBy);

  if (task.assignedUser) {
    await notifyUser(tenantId, task.assignedUser, `New Task Assigned: ${task.title}`);
  }

  return task;
};

const updateTask = async (tenantId, id, data, updatedBy) => {
  const oldTask = await Task.findOne({ _id: id, tenantId, isDeleted: false });
  if (!oldTask) throw new AppError('Task not found', 404);

  const task = await Task.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { ...data, updatedBy },
    { new: true, runValidators: true }
  );

  let details = `Task "${task.title}" updated`;
  let action = 'UPDATE';

  if (oldTask.status !== task.status) {
    action = 'STAGE_CHANGE';
    details = `Task status marked as "${task.status}"`;
  }

  if (oldTask.assignedUser !== task.assignedUser) {
    action = 'ASSIGNMENT_CHANGE';
    details = `Task assigned to "${task.assignedUser || 'None'}"`;
    if (task.assignedUser) {
      await notifyUser(tenantId, task.assignedUser, `Task Assigned: ${task.title}`);
    }
  }

  await logActivity(tenantId, action, 'tasks', task._id, details, updatedBy);
  return task;
};

const deleteTask = async (tenantId, id, updatedBy) => {
  const task = await Task.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { isDeleted: true, updatedBy },
    { new: true }
  );
  if (!task) throw new AppError('Task not found', 404);

  await logActivity(tenantId, 'DELETE', 'tasks', task._id, `Task "${task.title}" deleted`, updatedBy);
  return task;
};

// ==========================================
// 7. Follow Ups Service
// ==========================================
const getFollowUps = async (tenantId, filters = {}) => {
  const filter = { tenantId, isDeleted: false };
  return await FollowUp.find(filter)
    .populate('customer')
    .sort({ date: 1, time: 1 });
};

const getFollowUpById = async (tenantId, id) => {
  const followUp = await FollowUp.findOne({ _id: id, tenantId, isDeleted: false }).populate('customer');
  if (!followUp) throw new AppError('FollowUp not found', 404);
  return followUp;
};

const createFollowUp = async (tenantId, data, createdBy) => {
  const followUp = new FollowUp({ ...data, tenantId, createdBy, updatedBy: createdBy });
  await followUp.save();

  await logActivity(tenantId, 'CREATE', 'followups', followUp._id, `Follow-up scheduled on ${data.date} at ${data.time}`, createdBy);

  // Set notification reminder check triggers on backend start/creation
  if (data.assignedUser) {
    await notifyUser(tenantId, data.assignedUser, `Upcoming Follow Up Scheduled: ${followUp.reminder}`);
  }

  return followUp;
};

const updateFollowUp = async (tenantId, id, data, updatedBy) => {
  const followUp = await FollowUp.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { ...data, updatedBy },
    { new: true, runValidators: true }
  ).populate('customer');
  if (!followUp) throw new AppError('FollowUp not found', 404);

  await logActivity(tenantId, 'UPDATE', 'followups', followUp._id, `Follow-up updated to ${data.date} ${data.time}`, updatedBy);
  return followUp;
};

const deleteFollowUp = async (tenantId, id, updatedBy) => {
  const followUp = await FollowUp.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { isDeleted: true, updatedBy },
    { new: true }
  );
  if (!followUp) throw new AppError('FollowUp not found', 404);

  await logActivity(tenantId, 'DELETE', 'followups', followUp._id, 'Follow-up deleted', updatedBy);
  return followUp;
};

// ==========================================
// 8. Activities Service
// ==========================================
const getActivities = async (tenantId, filters = {}) => {
  const filter = { tenantId };
  if (filters.type) filter.type = filters.type;
  if (filters.customer) filter.customer = filters.customer;

  return await Activity.find(filter)
    .populate('customer')
    .sort({ timestamp: -1 });
};

const createActivity = async (tenantId, data, createdBy) => {
  const activity = new Activity({ ...data, tenantId, createdBy });
  await activity.save();
  return activity;
};

// ==========================================
// 9. Notifications Service
// ==========================================
const getNotifications = async (tenantId, user) => {
  const filter = { tenantId };
  if (user) filter.user = user;
  return await Notification.find(filter).sort({ createdAt: -1 });
};

const markNotificationRead = async (tenantId, id) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, tenantId },
    { read: true },
    { new: true }
  );
  return notification;
};

// ==========================================
// Orders Service
// ==========================================
const createOrderFromLeadDB = async (tenantId, lead, userId) => {
  const count = await Order.countDocuments({ tenantId });
  const orderNumber = 'ORD-' + (1000 + count + 1);

  const products = lead.quotation?.products || [];
  const totalAmount = lead.quotation?.totalAmount || 0;
  const expectedDeliveryDate = lead.quotation?.expectedDeliveryDate || null;
  const notes = lead.quotation?.notes || '';

  const order = new Order({
    leadId: lead._id,
    orderNumber,
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
    statusHistory: [{ status: 'Pending', updatedBy: userId, notes: 'Order automatically created from Lead' }],
    tenantId,
    createdBy: userId,
    updatedBy: userId
  });
  await order.save();

  await logActivity(tenantId, 'CREATE', 'orders', order._id, `Order ${orderNumber} created from Lead "${lead.name}"`, userId);
  return order;
};

const getOrders = async (tenantId, queryParams = {}) => {
  const { status, paymentStatus, search, page = 1, limit = 50 } = queryParams;
  const filter = { tenantId, isDeleted: false };

  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (search) {
    filter.$or = [
      { customerName: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      { orderNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Order.countDocuments(filter);
  const data = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return { data, total, page: parseInt(page), limit: parseInt(limit) };
};

const getOrderById = async (tenantId, id) => {
  const order = await Order.findOne({ _id: id, tenantId, isDeleted: false }).populate('leadId');
  if (!order) throw new AppError('Order not found', 404);
  return order;
};

const createOrder = async (tenantId, data, createdBy) => {
  const count = await Order.countDocuments({ tenantId });
  const orderNumber = 'ORD-' + (1000 + count + 1);

  const order = new Order({
    ...data,
    orderNumber,
    tenantId,
    createdBy,
    updatedBy: createdBy,
    statusHistory: [{ status: data.status || 'Pending', updatedBy: createdBy, notes: 'Order created manually' }]
  });
  await order.save();

  await logActivity(tenantId, 'CREATE', 'orders', order._id, `Order "${orderNumber}" created`, createdBy);
  return order;
};

const updateOrder = async (tenantId, id, data, updatedBy) => {
  const oldOrder = await Order.findOne({ _id: id, tenantId, isDeleted: false });
  if (!oldOrder) throw new AppError('Order not found', 404);

  if (data.status === 'Completed') {
    const payments = await Payment.find({ orderId: id, tenantId });
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    if (totalPaid < oldOrder.totalAmount - 0.01) {
      throw new AppError(`Cannot mark order as Completed. Payment is not fully received. (Paid: ₹${totalPaid.toFixed(2)} / Grand Total: ₹${oldOrder.totalAmount.toFixed(2)})`, 400);
    }
  }

  const statusChanged = data.status && data.status !== oldOrder.status;

  let updateQuery = { $set: { ...data, updatedBy } };
  if (statusChanged) {
    updateQuery.$push = {
      statusHistory: { status: data.status, updatedBy, notes: data.statusNotes || 'Status updated' }
    };
  }

  const order = await Order.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    updateQuery,
    { new: true, runValidators: true }
  );

  let details = `Order "${order.orderNumber}" updated`;
  let action = 'UPDATE';

  if (statusChanged) {
    action = 'STAGE_CHANGE';
    details = `Order status changed from "${oldOrder.status}" to "${order.status}"`;
  }

  await logActivity(tenantId, action, 'orders', order._id, details, updatedBy);
  return order;
};

const deleteOrder = async (tenantId, id, updatedBy) => {
  const order = await Order.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { isDeleted: true, updatedBy },
    { new: true }
  );
  if (!order) throw new AppError('Order not found', 404);

  await logActivity(tenantId, 'DELETE', 'orders', order._id, `Order "${order.orderNumber}" soft-deleted`, updatedBy);
  return order;
};

// ==========================================
// Payments Service
// ==========================================
const getPayments = async (tenantId, queryParams = {}) => {
  const filter = { tenantId };
  if (queryParams.orderId) filter.orderId = queryParams.orderId;

  return await Payment.find(filter).sort({ paymentDate: -1 });
};

const createPayment = async (tenantId, data, createdBy) => {
  const payment = new Payment({
    ...data,
    amount: Number(data.amount) || 0,
    tenantId,
    createdBy
  });
  await payment.save();

  // Recalculate outstanding balance on the order
  const order = await Order.findOne({ _id: data.orderId, tenantId, isDeleted: false });
  if (order) {
    const orderPayments = await Payment.find({ orderId: data.orderId, tenantId });
    const totalPaid = orderPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = order.totalAmount - totalPaid;

    if (balance <= 0) {
      order.paymentStatus = 'Paid';
    } else if (totalPaid > 0) {
      order.paymentStatus = 'Partially Paid';
    } else {
      order.paymentStatus = 'Unpaid';
    }
    await order.save();
  }

  await logActivity(tenantId, 'PAYMENT', 'orders', data.orderId, `Recorded payment of ${data.amount} for Order`, createdBy);
  return payment;
};

// ==========================================
// Expenses Service
// ==========================================
const getExpenses = async (tenantId, queryParams = {}) => {
  const { category, search, page = 1, limit = 50 } = queryParams;
  const filter = { tenantId, isDeleted: false };

  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: 'i' } },
      { vendor: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Expense.countDocuments(filter);
  const data = await Expense.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return { data, total, page: parseInt(page), limit: parseInt(limit) };
};

const createExpense = async (tenantId, data, createdBy) => {
  const expense = new Expense({
    ...data,
    amount: Number(data.amount) || 0,
    tenantId,
    createdBy
  });
  await expense.save();

  await logActivity(tenantId, 'CREATE', 'expenses', expense._id, `Expense of ${expense.amount} under ${expense.category} created`, createdBy);
  return expense;
};

const updateExpense = async (tenantId, id, data, updatedBy) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { ...data, updatedBy },
    { new: true, runValidators: true }
  );
  if (!expense) throw new AppError('Expense not found', 404);

  await logActivity(tenantId, 'UPDATE', 'expenses', expense._id, `Expense updated`, updatedBy);
  return expense;
};

const deleteExpense = async (tenantId, id, updatedBy) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { isDeleted: true, updatedBy },
    { new: true }
  );
  if (!expense) throw new AppError('Expense not found', 404);

  await logActivity(tenantId, 'DELETE', 'expenses', expense._id, `Expense deleted`, updatedBy);
  return expense;
};

// ==========================================
// 10. Dashboard & Reports Analytics
// ==========================================
const getDashboardStats = async (tenantId) => {
  // Query totals
  const totalLeads = await Lead.countDocuments({ tenantId, isDeleted: false });
  const totalContacts = await Contact.countDocuments({ tenantId, isDeleted: false });
  const totalCompanies = await Company.countDocuments({ tenantId, isDeleted: false });

  // Lead stages counts
  const leadMetrics = {
    totalLeads,
    newLeads: await Lead.countDocuments({ tenantId, isDeleted: false, status: 'New' }),
    contactedLeads: await Lead.countDocuments({ tenantId, isDeleted: false, status: 'Contacted' }),
    proposalSentLeads: await Lead.countDocuments({ tenantId, isDeleted: false, status: 'Proposal Sent' }),
    convertedLeads: await Lead.countDocuments({ tenantId, isDeleted: false, status: 'Order Confirmed' }),
    lostLeads: await Lead.countDocuments({ tenantId, isDeleted: false, status: 'Lost' })
  };

  // Orders metrics
  const orderMetrics = {
    totalOrders: await Order.countDocuments({ tenantId, isDeleted: false }),
    pendingOrders: await Order.countDocuments({ tenantId, isDeleted: false, status: 'Pending' }),
    processingOrders: await Order.countDocuments({ tenantId, isDeleted: false, status: 'Processing' }),
    completedOrders: await Order.countDocuments({ tenantId, isDeleted: false, status: 'Completed' })
  };

  // Financial metrics
  const payments = await Payment.find({ tenantId });
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const expenses = await Expense.find({ tenantId, isDeleted: false });
  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  // Outstanding payments across all non-cancelled orders
  const orders = await Order.find({ tenantId, isDeleted: false, status: { $ne: 'Cancelled' } });
  let outstandingPayments = 0;
  orders.forEach(o => {
    const orderPayments = payments.filter(p => p.orderId.toString() === o._id.toString());
    const paid = orderPayments.reduce((sum, p) => sum + p.amount, 0);
    outstandingPayments += Math.max(0, o.totalAmount - paid);
  });

  const financialMetrics = {
    totalRevenue,
    totalExpenses,
    netProfit,
    outstandingPayments
  };

  // Deals metrics (legacy support)
  const openDeals = await Deal.countDocuments({
    tenantId,
    isDeleted: false,
    stage: { $nin: ['Won', 'Lost'] }
  });
  const wonDealsCount = await Deal.countDocuments({ tenantId, isDeleted: false, stage: 'Won' });
  const lostDealsCount = await Deal.countDocuments({ tenantId, isDeleted: false, stage: 'Lost' });
  const wonDeals = await Deal.find({ tenantId, isDeleted: false, stage: 'Won' });
  const legacyRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  // Recent system activity logs
  const recentActivities = await ActivityLog.find({ tenantId })
    .sort({ timestamp: -1 })
    .limit(10);

  // Upcoming followups (today and future)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingFollowUps = await FollowUp.find({
    tenantId,
    isDeleted: false,
    date: { $gte: today }
  })
    .populate('customer')
    .sort({ date: 1, time: 1 })
    .limit(5);

  return {
    totalLeads,
    totalCustomers: totalContacts + totalCompanies,
    openDeals,
    wonDeals: wonDealsCount,
    lostDeals: lostDealsCount,
    revenue: legacyRevenue,
    recentActivities,
    upcomingFollowUps,
    leadMetrics,
    orderMetrics,
    financialMetrics
  };
};

const getReportsStats = async (tenantId) => {
  const allDeals = await Deal.find({ tenantId, isDeleted: false });
  const totalDeals = allDeals.length;

  const wonDeals = allDeals.filter(d => d.stage === 'Won');
  const lostDeals = allDeals.filter(d => d.stage === 'Lost');
  const wonCount = wonDeals.length;
  const lostCount = lostDeals.length;

  // Conversion rates (leads to won deals/customers)
  const totalLeads = await Lead.countDocuments({ tenantId, isDeleted: false });
  const convertedLeads = await Lead.countDocuments({ tenantId, isDeleted: false, status: 'Order Confirmed' });
  const leadConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // Win/Lost ratio
  const winLossRatio = (wonCount + lostCount) > 0 ? (wonCount / (wonCount + lostCount)) * 100 : 0;

  // Revenue pipeline by stages
  const revenueByStage = {};
  allDeals.forEach(d => {
    revenueByStage[d.stage] = (revenueByStage[d.stage] || 0) + (d.value || 0);
  });

  // Sales staff performance: deals created & total values
  const staffPerformance = {};
  allDeals.forEach(d => {
    const user = d.assignedUser || 'Unassigned';
    if (!staffPerformance[user]) {
      staffPerformance[user] = { count: 0, value: 0, wonCount: 0, wonValue: 0 };
    }
    staffPerformance[user].count += 1;
    staffPerformance[user].value += d.value;
    if (d.stage === 'Won') {
      staffPerformance[user].wonCount += 1;
      staffPerformance[user].wonValue += d.value;
    }
  });

  return {
    totalLeads,
    leadConversionRate,
    winLossRatio,
    revenueByStage,
    staffPerformance,
    wonCount,
    lostCount,
    totalDealsValue: allDeals.reduce((sum, d) => sum + (d.value || 0), 0),
    wonDealsValue: wonDeals.reduce((sum, d) => sum + (d.value || 0), 0)
  };
};

const wrapService = (fnName, dbFn) => {
  return async function(...args) {
    if (!isDBConnected()) {
      const inMemFn = crmInMemoryService[fnName];
      if (inMemFn) {
        return inMemFn(...args);
      }
    }
    try {
      return await dbFn(...args);
    } catch (err) {
      console.warn(`MongoDB operation ${fnName} failed: ${err.message}. Falling back to in-memory.`);
      const inMemFn = crmInMemoryService[fnName];
      if (inMemFn) {
        return inMemFn(...args);
      }
      throw err;
    }
  };
};

module.exports = {
  getSettings: wrapService('getSettings', getSettings),
  updateSettings: wrapService('updateSettings', updateSettings),
  
  getLeads: wrapService('getLeads', getLeads),
  getLeadById: wrapService('getLeadById', getLeadById),
  createLead: wrapService('createLead', createLead),
  updateLead: wrapService('updateLead', updateLead),
  deleteLead: wrapService('deleteLead', deleteLead),
  
  getContacts: wrapService('getContacts', getContacts),
  getContactById: wrapService('getContactById', getContactById),
  createContact: wrapService('createContact', createContact),
  updateContact: wrapService('updateContact', updateContact),
  deleteContact: wrapService('deleteContact', deleteContact),
  
  getCompanies: wrapService('getCompanies', getCompanies),
  getCompanyById: wrapService('getCompanyById', getCompanyById),
  createCompany: wrapService('createCompany', createCompany),
  updateCompany: wrapService('updateCompany', updateCompany),
  deleteCompany: wrapService('deleteCompany', deleteCompany),
  
  getDeals: wrapService('getDeals', getDeals),
  getDealById: wrapService('getDealById', getDealById),
  createDeal: wrapService('createDeal', createDeal),
  updateDeal: wrapService('updateDeal', updateDeal),
  deleteDeal: wrapService('deleteDeal', deleteDeal),
  
  getTasks: wrapService('getTasks', getTasks),
  getTaskById: wrapService('getTaskById', getTaskById),
  createTask: wrapService('createTask', createTask),
  updateTask: wrapService('updateTask', updateTask),
  deleteTask: wrapService('deleteTask', deleteTask),
  
  getFollowUps: wrapService('getFollowUps', getFollowUps),
  getFollowUpById: wrapService('getFollowUpById', getFollowUpById),
  createFollowUp: wrapService('createFollowUp', createFollowUp),
  updateFollowUp: wrapService('updateFollowUp', updateFollowUp),
  deleteFollowUp: wrapService('deleteFollowUp', deleteFollowUp),
  
  getActivities: wrapService('getActivities', getActivities),
  createActivity: wrapService('createActivity', createActivity),
  
  getNotifications: wrapService('getNotifications', getNotifications),
  markNotificationRead: wrapService('markNotificationRead', markNotificationRead),
  
  getDashboardStats: wrapService('getDashboardStats', getDashboardStats),
  getReportsStats: wrapService('getReportsStats', getReportsStats),

  getOrders: wrapService('getOrders', getOrders),
  getOrderById: wrapService('getOrderById', getOrderById),
  createOrder: wrapService('createOrder', createOrder),
  updateOrder: wrapService('updateOrder', updateOrder),
  deleteOrder: wrapService('deleteOrder', deleteOrder),

  getPayments: wrapService('getPayments', getPayments),
  createPayment: wrapService('createPayment', createPayment),

  getExpenses: wrapService('getExpenses', getExpenses),
  createExpense: wrapService('createExpense', createExpense),
  updateExpense: wrapService('updateExpense', updateExpense),
  deleteExpense: wrapService('deleteExpense', deleteExpense)
};
