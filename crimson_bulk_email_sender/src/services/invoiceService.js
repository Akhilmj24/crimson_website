const Invoice = require('../models/Invoice');
const AppError = require('../utils/AppError');

const getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new AppError('Invoice draft not found', 404);
  }
  return invoice;
};

const getAllInvoices = async (filter = {}) => {
  return await Invoice.find(filter).sort({ updatedAt: -1 });
};

const createInvoice = async (data) => {
  const invoice = new Invoice(data);
  await invoice.save();
  return invoice;
};

const updateInvoice = async (id, data) => {
  const invoice = await Invoice.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
  if (!invoice) {
    throw new AppError('Invoice draft not found for update', 404);
  }
  return invoice;
};

const deleteInvoice = async (id) => {
  const invoice = await Invoice.findByIdAndDelete(id);
  if (!invoice) {
    throw new AppError('Invoice draft not found for deletion', 404);
  }
  return invoice;
};

module.exports = {
  getInvoiceById,
  getAllInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
