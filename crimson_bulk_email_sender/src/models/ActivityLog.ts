// @ts-nocheck
import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. CREATE, UPDATE, DELETE, STAGE_CHANGE, ASSIGNMENT_CHANGE
  module: { type: String, required: true }, // e.g. leads, contacts, companies, deals, tasks, followups
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  details: { type: String, default: '' },
  tenantId: { type: String, required: true, index: true },
  createdBy: { type: String, default: 'system' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('ActivityLog', activityLogSchema);;
