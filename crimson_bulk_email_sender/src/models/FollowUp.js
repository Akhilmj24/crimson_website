const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g. "14:00"
  reminder: { type: String, default: '' },
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
  tenantId: { type: String, required: true, index: true },
  isDeleted: { type: Boolean, default: false, index: true },
  createdBy: { type: String, default: 'system' },
  updatedBy: { type: String, default: 'system' }
}, {
  timestamps: true
});

module.exports = mongoose.model('FollowUp', followUpSchema);
