const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  description:  { type: String, required: true },
  image:        { type: String, required: true }, // Main image
  images:       [{ type: String }],
  videos:       [{ type: String }],
  price:        { type: Number, required: true },
  countInStock: { type: Number, required: true },
  category:     { type: String, required: true },
  brand:        { type: String, required: true },
  rating:       { type: Number, default: 0 },
  numReviews:   { type: Number, default: 0 },
  reviews:      [reviewSchema],   // <-- add this!
  seller:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
