const Joi = require('joi');

// Joi schema to validate house data with availability and quantity
const houseSchema = Joi.object({
  title: Joi.string().required(),
  main_image: Joi.string().required(), // Path to main image in the local server folder
  images: Joi.array().items(Joi.string()).required(), // New field for additional images as an array of paths
  location: Joi.object({
    state: Joi.string().required(),
    city: Joi.string().required(),
    zipcode: Joi.string().required(),
    address: Joi.string().required()
  }).required(),
  price: Joi.number().positive().required(),
  amenities: Joi.array().items(Joi.string()),
  propertyType: Joi.string().valid('apartment', 'house', 'villa', 'cottage', 'studio').required(),
  rating: Joi.number().min(0).max(5).default(0),
  availableFrom: Joi.date().required(),
  availableTo: Joi.date().greater(Joi.ref('availableFrom')).required(),
  maxGuests: Joi.number().integer().positive().required(),
  bookedDates: Joi.array().items(Joi.date()).default([]), // Array of dates representing each booked day
  contactInfo: Joi.object({
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/).required(),
    website: Joi.string().uri().required()
  }).required() // New contact information object
});

module.exports = houseSchema;
