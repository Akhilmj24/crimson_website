// @ts-nocheck
const validateLead = (data) => {
  if (!data) return { error: 'Request body is empty' };
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    return { error: 'Lead name is required and must be a string' };
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { error: 'Invalid email address format' };
  }
  if (data.tags && !Array.isArray(data.tags)) {
    return { error: 'tags must be an array of strings' };
  }
  if (data.notes && !Array.isArray(data.notes)) {
    return { error: 'notes must be an array of strings' };
  }
  return { error: null };
};

const validateContact = (data) => {
  if (!data) return { error: 'Request body is empty' };
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    return { error: 'Contact name is required and must be a string' };
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { error: 'Invalid email address format' };
  }
  return { error: null };
};

const validateCompany = (data) => {
  if (!data) return { error: 'Request body is empty' };
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    return { error: 'Company name is required and must be a string' };
  }
  return { error: null };
};

const validateDeal = (data) => {
  if (!data) return { error: 'Request body is empty' };
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    return { error: 'Deal name is required and must be a string' };
  }
  if (!data.customer) {
    return { error: 'Customer ID is required' };
  }
  if (!data.customerModel || !['Lead', 'Contact', 'Company'].includes(data.customerModel)) {
    return { error: 'customerModel must be Lead, Contact, or Company' };
  }
  if (data.value !== undefined && (typeof data.value !== 'number' || data.value < 0)) {
    return { error: 'Deal value must be a positive number' };
  }
  return { error: null };
};

const validateTask = (data) => {
  if (!data) return { error: 'Request body is empty' };
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    return { error: 'Task title is required and must be a string' };
  }
  if (data.priority && !['Low', 'Medium', 'High'].includes(data.priority)) {
    return { error: 'Priority must be Low, Medium, or High' };
  }
  if (data.status && !['Pending', 'Completed'].includes(data.status)) {
    return { error: 'Status must be Pending or Completed' };
  }
  return { error: null };
};

const validateFollowUp = (data) => {
  if (!data) return { error: 'Request body is empty' };
  if (!data.date) {
    return { error: 'Follow up date is required' };
  }
  if (!data.time || typeof data.time !== 'string') {
    return { error: 'Follow up time is required' };
  }
  if (!data.customer) {
    return { error: 'Customer ID is required' };
  }
  if (!data.customerModel || !['Lead', 'Contact', 'Company'].includes(data.customerModel)) {
    return { error: 'customerModel must be Lead, Contact, or Company' };
  }
  return { error: null };
};

const validateSettings = (data) => {
  if (!data) return { error: 'Request body is empty' };
  if (data.leadSources && !Array.isArray(data.leadSources)) {
    return { error: 'leadSources must be an array' };
  }
  if (data.tags && !Array.isArray(data.tags)) {
    return { error: 'tags must be an array' };
  }
  if (data.dealStages && !Array.isArray(data.dealStages)) {
    return { error: 'dealStages must be an array' };
  }
  return { error: null };
};

const validateOrder = (data) => {
  if (!data) return { error: 'Request body is empty' };
  if (data.customerName === undefined) {
    if (data.status || data.statusNotes || data.paymentStatus) {
      return { error: null };
    }
    return { error: 'Customer name is required' };
  }
  if (typeof data.customerName !== 'string' || !data.customerName.trim()) {
    return { error: 'Customer name is required' };
  }
  if (data.totalAmount !== undefined && (typeof data.totalAmount !== 'number' || data.totalAmount < 0)) {
    return { error: 'Total amount must be a positive number' };
  }
  return { error: null };
};

const validatePayment = (data) => {
  if (!data) return { error: 'Request body is empty' };
  if (!data.orderId) {
    return { error: 'Order ID is required' };
  }
  if (data.amount === undefined || typeof data.amount !== 'number' || data.amount <= 0) {
    return { error: 'Amount is required and must be a positive number' };
  }
  if (!data.paymentMethod || !['Cash', 'Bank Transfer', 'Card', 'UPI', 'Check', 'Other'].includes(data.paymentMethod)) {
    return { error: 'Valid payment method is required' };
  }
  return { error: null };
};

const validateExpense = (data) => {
  if (!data) return { error: 'Request body is empty' };
  if (!data.category || !['Office Expenses', 'Travel', 'Marketing', 'Salary', 'Utilities', 'Miscellaneous'].includes(data.category)) {
    return { error: 'Valid category is required' };
  }
  if (data.amount === undefined || typeof data.amount !== 'number' || data.amount <= 0) {
    return { error: 'Amount is required and must be a positive number' };
  }
  if (!data.date) {
    return { error: 'Date is required' };
  }
  if (data.spentBy && typeof data.spentBy !== 'string') {
    return { error: 'spentBy must be a string' };
  }
  if (data.attachmentName && typeof data.attachmentName !== 'string') {
    return { error: 'attachmentName must be a string' };
  }
  return { error: null };
};

export { 
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
 };
