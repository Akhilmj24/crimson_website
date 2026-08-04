const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  paymentDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Card', 'UPI', 'Check', 'Other'],
    required: true
  },
  transactionReference: { type: String, default: '' },
  notes: { type: String, default: '' },
  tenantId: { type: String, required: true, index: true },
  createdBy: { type: String, default: 'system' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
