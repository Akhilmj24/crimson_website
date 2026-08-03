const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['Call', 'Meeting', 'Email', 'Note', 'WhatsApp', 'Task'] 
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'customerModel' 
  },
  customerModel: { 
    type: String, 
    enum: ['Lead', 'Contact', 'Company'] 
  },
  tenantId: { type: String, required: true, index: true },
  createdBy: { type: String, default: 'system' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
