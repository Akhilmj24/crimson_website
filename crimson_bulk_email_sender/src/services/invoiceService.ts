// @ts-nocheck
import Invoice from '../models/Invoice';
import AppError from '../utils/AppError';

const getInvoiceById = async (id) => {
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new AppError('Invoice draft not found', 404);
  }
  return invoice;
};

const getAllInvoices = async (filter: any = {}) => {
  return await Invoice.find(filter).sort({ updatedAt: -1 });
};

const createInvoice = async (data) => {
  const invoice = new Invoice(data);
  await invoice.save();
  return invoice;
};

const updateInvoice = async (id, data) => {
  const invoice = await Invoice.findByIdAndUpdate(id, data, {
    returnDocument: 'after',
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

export default { 
  getInvoiceById,
  getAllInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
 };
