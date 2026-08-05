const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  description: { type: String, required: true },
  size: { type: String, default: '' },
  price: { type: Number, default: 0 },
  gstRate: { type: Number, default: 18 },
  image: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
