// @ts-nocheck
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: String, required: true }, // Username or ID to whom the notification is targeted
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  tenantId: { type: String, required: true, index: true }
}, {
  timestamps: true
});

export default mongoose.model('Notification', notificationSchema);;
