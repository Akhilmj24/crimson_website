const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String, default: '' },
  website: { type: String, default: '' },
  address: { type: String, default: '' },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
  notes: [{ type: String }],
  tenantId: { type: String, required: true, index: true },
  isDeleted: { type: Boolean, default: false, index: true },
  createdBy: { type: String, default: 'system' },
  updatedBy: { type: String, default: 'system' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
