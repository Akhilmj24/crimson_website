const mongoose = require('mongoose');

const proposalSectionSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  templateType: { type: String, default: 'text' } // e.g. text, pricing table
});

const proposalSchema = new mongoose.Schema({
  sender: {
    logo: { type: String, default: '' },
    name: { type: String, default: '' },
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    address: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  recipient: {
    company: { type: String, default: '' },
    contactPerson: { type: String, default: '' },
    salutation: { type: String, default: '' },
    name: { type: String, default: '' },
    title: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  sections: [proposalSectionSchema],
  meta: {
    quoteNo: { type: String, default: '' },
    proposalId: { type: String, default: '' },
    date: { type: String, default: '' },
    subject: { type: String, default: '' },
    salutation: { type: String, default: '' },
    intro: { type: String, default: '' }
  },
  userId: { type: String, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Proposal', proposalSchema);
