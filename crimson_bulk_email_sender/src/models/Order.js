const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 }, // percentage or flat
  tax: { type: Number, default: 0 } // percentage rate
});

const orderStatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: String, default: 'system' },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

const orderSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  orderNumber: { type: String, required: true, unique: true, index: true },
  customerName: { type: String, required: true },
  companyName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Production', 'Ready for Dispatch', 'Shipped', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  products: [orderProductSchema],
  totalAmount: { type: Number, required: true, default: 0 },
  expectedDeliveryDate: { type: Date },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid'],
    default: 'Unpaid'
  },
  notes: { type: String, default: '' },
  attachments: [{ type: String }],
  statusHistory: [orderStatusHistorySchema],
  tenantId: { type: String, required: true, index: true },
  isDeleted: { type: Boolean, default: false, index: true },
  createdBy: { type: String, default: 'system' },
  updatedBy: { type: String, default: 'system' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
