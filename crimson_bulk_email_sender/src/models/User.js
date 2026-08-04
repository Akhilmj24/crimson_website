const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['super_admin', 'Admin', 'Manager', 'Agent'],
    default: 'Agent' 
  },
  tenantId: { 
    type: String, 
    required: true, 
    index: true 
  },
  isDeleted: { 
    type: Boolean, 
    default: false, 
    index: true 
  },
  createdBy: { 
    type: String, 
    default: 'system' 
  },
  refreshToken: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
