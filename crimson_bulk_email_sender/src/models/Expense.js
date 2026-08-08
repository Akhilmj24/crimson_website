const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Office Expenses', 'Travel', 'Marketing', 'Salary', 'Utilities', 'Miscellaneous'],
    required: true
  },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  title: { type: String, default: '' },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Card', 'UPI', 'Check', 'Other'],
    default: 'Cash'
  },
  description: { type: String, default: '' },
  attachment: { type: String, default: '' }, // file name or URL for receipt/bill
  spentBy: { type: String, default: '' },
  attachmentName: { type: String, default: '' },
  tenantId: { type: String, required: true, index: true },
  isDeleted: { type: Boolean, default: false, index: true },
  createdBy: { type: String, default: 'system' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
