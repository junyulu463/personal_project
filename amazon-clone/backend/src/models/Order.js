const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  seller:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // NEW: Seller for this item
  name:       { type: String, required: true },
  qty:        { type: Number, required: true },
  price:      { type: Number, required: true },
  image:      { type: String, required: true },
  isDelivered:   { type: Boolean, default: false },      // NEW: Delivery status per item
  deliveredAt:   { type: Date },       
});

const addressSchema = new mongoose.Schema({
  label:      { type: String }, // e.g. "Home", "Work"
  recipient:  { type: String },
  address:    { type: String, required: true },
  city:       { type: String, required: true },
  postalCode: { type: String, required: true },
  country:    { type: String, required: true }
});

// NEW: Payment method details (matches user schema)
const paymentMethodSchema = new mongoose.Schema({
  cardType:        { type: String, required: true }, // "Visa", "MasterCard", etc.
  cardNumber:      { type: String, required: true },
  cardholderName:  { type: String, required: true },
  expMonth:        { type: Number, required: true },
  expYear:         { type: Number, required: true },
  billingAddress:  addressSchema,
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  // Shipping and billing addresses (both required)
  shippingAddress: addressSchema,                 // Use enhanced schema
  billingAddress:  addressSchema,                 // NEW: Separate billing address

  // Payment method: full info, not just string
  paymentMethod: paymentMethodSchema,             // NEW: Store card info
  paymentResult: {
    id:         { type: String },
    status:     { type: String },
    update_time:{ type: String },
    email_address: { type: String }
  },
  itemsPrice:    { type: Number, required: true },
  shippingPrice: { type: Number, required: true },
  taxPrice:      { type: Number, required: true },
  totalPrice:    { type: Number, required: true },
  isPaid:        { type: Boolean, default: false },
  paidAt:        { type: Date },
  isDelivered:   { type: Boolean, default: false },// Order-level delivered flag (true if all items delivered)
  deliveredAt:   { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
