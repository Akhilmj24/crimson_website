const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  salutation: { type: String, default: '' },
  name: { type: String, required: true },
  company: { type: String, default: '' }, // Company name or ID
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  socialLinks: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' }
  },
  notes: [{ type: String }],
  tenantId: { type: String, required: true, index: true },
  isDeleted: { type: Boolean, default: false, index: true },
  createdBy: { type: String, default: 'system' },
  updatedBy: { type: String, default: 'system' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
