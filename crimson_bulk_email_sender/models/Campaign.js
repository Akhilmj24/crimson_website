const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'sending', 'success', 'error'], 
    default: 'pending' 
  },
  message: { 
    type: String, 
    default: '' 
  }
});

const campaignSchema = new mongoose.Schema({
  subject: { 
    type: String, 
    required: true 
  },
  totalEmails: { 
    type: Number, 
    default: 0 
  },
  successCount: { 
    type: Number, 
    default: 0 
  },
  errorCount: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['sending', 'completed', 'failed'], 
    default: 'sending' 
  },
  smtpHost: { 
    type: String, 
    default: 'default' 
  },
  smtpUser: { 
    type: String, 
    default: '' 
  },
  recipients: [recipientSchema],
  logs: [{
    timestamp: { type: Date, default: Date.now },
    text: String,
    type: { type: String, default: '' }
  }],
  sentAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Campaign', campaignSchema);
