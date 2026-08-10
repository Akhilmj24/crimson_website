// @ts-nocheck
import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  description: { type: String, required: true },
  size: { type: String, default: '' },
  qty: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  gstRate: { type: Number, default: 18 },
  image: { type: String, default: '' }
});

const masterProductSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  description: { type: String, required: true },
  size: { type: String, default: '' },
  price: { type: Number, default: 0 },
  gstRate: { type: Number, default: 18 },
  image: { type: String, default: '' }
});

const invoiceSchema = new mongoose.Schema({
  customerDetails: {
    name: { type: String, default: '' },
    attnSalutation: { type: String, default: '' },
    attn: { type: String, default: '' },
    phone: { type: String, default: '' },
    destination: { type: String, default: '' }
  },
  sellerDetails: {
    name: { type: String, default: '' },
    office: { type: String, default: '' },
    gstin: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  items: [invoiceItemSchema],
  gstEnabled: { type: Boolean, default: true },
  showGstin: { type: Boolean, default: true },
  showTotal: { type: Boolean, default: true },
  terms: [String],
  meta: {
    quoteNo: { type: String, default: '' },
    date: { type: String, default: '' }
  },
  masterProducts: [masterProductSchema],
  userId: { type: String, default: null }
}, {
  timestamps: true
});

export default mongoose.model('Invoice', invoiceSchema);;
