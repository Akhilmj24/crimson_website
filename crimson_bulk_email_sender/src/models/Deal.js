const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    refPath: 'customerModel' 
  },
  customerModel: { 
    type: String, 
    required: true, 
    enum: ['Lead', 'Contact', 'Company'] 
  },
  value: { type: Number, required: true, default: 0 },
  closingDate: { type: Date },
  stage: { 
    type: String, 
    required: true, 
    enum: ['New', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'],
    default: 'New'
  },
  assignedUser: { type: String, default: '' },
  notes: [{ type: String }],
  tenantId: { type: String, required: true, index: true },
  isDeleted: { type: Boolean, default: false, index: true },
  createdBy: { type: String, default: 'system' },
  updatedBy: { type: String, default: 'system' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Deal', dealSchema);
