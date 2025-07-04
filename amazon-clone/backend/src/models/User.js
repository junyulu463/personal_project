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

const addressSchema = new mongoose.Schema({
  label:      { type: String }, // e.g. "Home", "Work"
  address:    { type: String, required: true },
  city:       { type: String, required: true },
  postalCode: { type: String, required: true },
  country:    { type: String, required: true },
  isDefault:  { type: Boolean, default: false }
});

// ---------------------------
// NEW: Payment Method schema
const paymentMethodSchema = new mongoose.Schema({
  cardType:        { type: String, required: true }, // "Visa", "MasterCard", etc.
  cardNumber:      { type: String, required: true }, // FULL CARD NUMBER (store as string)
  cardholderName:  { type: String, required: true },
  expMonth:        { type: Number, required: true },
  expYear:         { type: Number, required: true },
  cvv:             { type: String, required: true }, // Only for demo/testing
  billingAddress:  addressSchema,  // Nested billing address
  isDefault:       { type: Boolean, default: false }
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
  productViewHistory: [productViewSchema],
  // --------
  shippingAddresses: [addressSchema],            // NEW: Array of shipping addresses
  defaultShippingAddressId: { type: mongoose.Schema.Types.ObjectId }, // NEW: ref to default shipping address
  billingAddresses: [addressSchema],             // NEW: Array of billing addresses
  defaultBillingAddressId: { type: mongoose.Schema.Types.ObjectId },  // NEW: ref to default billing address
  paymentMethods: [paymentMethodSchema],         // NEW: Array of payment methods
  defaultPaymentMethodId: { type: mongoose.Schema.Types.ObjectId },   // NEW: ref to default payment method  
});

module.exports = mongoose.model('User', userSchema);
