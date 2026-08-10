// @ts-nocheck
import invoiceService from '../services/invoiceService';
import catchAsync from '../utils/catchAsync';

const getInvoices = catchAsync(async (req, res, next) => {
  const invoices = await invoiceService.getAllInvoices();
  res.json(invoices);
});

const getInvoice = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const invoice = await invoiceService.getInvoiceById(id);
  res.json(invoice);
});

const createInvoice = catchAsync(async (req, res, next) => {
  const invoice = await invoiceService.createInvoice(req.body);
  res.status(201).json(invoice);
});

const updateInvoice = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const invoice = await invoiceService.updateInvoice(id, req.body);
  res.json(invoice);
});

const deleteInvoice = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await invoiceService.deleteInvoice(id);
  res.json({ success: true, message: 'Invoice draft deleted successfully.' });
});

export default { 
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice
 };
