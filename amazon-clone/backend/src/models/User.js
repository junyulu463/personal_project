const mongoose = require('mongoose');

// Each cart item gets an _id for unique reference
const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 }
}); // <-- remove { _id: false }

// Each order reference gets an _id
const orderRefSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  timestamp: { type: Date, default: Date.now }
}); // <-- remove { _id: false }

const productViewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  timestamp: { type: Date, default: Date.now }
});

const searchHistorySchema = new mongoose.Schema({
  query: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed!
  email:    { type: String, required: true, unique: true },
  name:     { type: String },
  address:  { type: String },
  phone:    { type: String },
  role:     { type: String, enum: ['admin', 'seller', 'buyer'], default: 'buyer' },
  cart:     [cartItemSchema],
  orderHistory: [orderRefSchema],
  unpaidOrders: [orderRefSchema],
  searchHistory: [searchHistorySchema],
  productViewHistory: [productViewSchema]
});

module.exports = mongoose.model('User', userSchema);
