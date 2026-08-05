const mongoose = require('mongoose');

const leadStatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: String, default: 'system' }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const leadQuotationProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 }, // percentage or flat
  tax: { type: Number, default: 0 } // percentage rate
});

const leadQuotationSchema = new mongoose.Schema({
  products: [leadQuotationProductSchema],
  totalAmount: { type: Number, default: 0 },
  expectedDeliveryDate: { type: Date },
  notes: { type: String, default: '' }
});

const leadSchema = new mongoose.Schema({
  salutation: { type: String, default: '' },
  name: { type: String, required: true },
  company: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  source: { type: String, default: 'Website' },
  status: { type: String, default: 'New' }, // e.g. New, Contacted, Proposal, Qualified, Won, Lost
  priority: { type: String, default: 'Medium' }, // Low, Medium, High
  assignedUser: { type: String, default: '' },
  tags: [{ type: String }],
  notes: [{ type: String }],
  attachments: [{ type: String }], // Array of file names or URLs
  statusHistory: [leadStatusHistorySchema],
  quotation: { type: leadQuotationSchema, default: () => ({}) },
  tenantId: { type: String, required: true, index: true },
  isDeleted: { type: Boolean, default: false, index: true },
  createdBy: { type: String, default: 'system' },
  updatedBy: { type: String, default: 'system' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
