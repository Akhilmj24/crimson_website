// @ts-nocheck
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: Date },
  assignedUser: { type: String, default: '' },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Completed'], 
    default: 'Pending' 
  },
  tenantId: { type: String, required: true, index: true },
  isDeleted: { type: Boolean, default: false, index: true },
  createdBy: { type: String, default: 'system' },
  updatedBy: { type: String, default: 'system' }
}, {
  timestamps: true
});

export default mongoose.model('Task', taskSchema);;
