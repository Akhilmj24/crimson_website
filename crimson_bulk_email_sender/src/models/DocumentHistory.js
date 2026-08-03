const mongoose = require('mongoose');

const documentHistorySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['proposal', 'invoice', 'both'],
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  documentId: {
    type: String,
    required: true
  },
  proposalData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  invoiceData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DocumentHistory', documentHistorySchema);
