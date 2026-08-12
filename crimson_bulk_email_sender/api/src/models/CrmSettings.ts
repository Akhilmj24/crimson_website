// @ts-nocheck
import mongoose from 'mongoose';

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
    default: ['New', 'Contacted', 'Proposal Sent', 'Follow Up', 'Negotiation', 'Order Confirmed', 'Lost', 'Closed'] 
  },
  customFields: [customFieldSchema],
  tenantId: { type: String, required: true, unique: true, index: true }
}, {
  timestamps: true
});

export default mongoose.model('CrmSettings', crmSettingsSchema);;
