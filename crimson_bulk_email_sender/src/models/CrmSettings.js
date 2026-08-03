const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fieldType: { type: String, required: true } // e.g. text, number, date
});

const crmSettingsSchema = new mongoose.Schema({
  leadSources: { 
    type: [String], 
    default: ['Website', 'Referral', 'Social Media', 'Cold Reach', 'Other'] 
  },
  tags: { 
    type: [String], 
    default: ['Warm', 'Cold', 'Enterprise', 'SMB', 'Important'] 
  },
  dealStages: { 
    type: [String], 
    default: ['New', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'] 
  },
  customFields: [customFieldSchema],
  tenantId: { type: String, required: true, unique: true, index: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('CrmSettings', crmSettingsSchema);
