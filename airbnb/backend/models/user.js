const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(), // Email with validation
  reservationData: Joi.array().items(
    Joi.object({
      propertyId: Joi.string().required(), // ID of the property
      checkInDate: Joi.date().required(), // Check-in date
      checkOutDate: Joi.date().min(Joi.ref('checkInDate')).required(), // Check-out date (greater than or equal to checkInDate)
    })
  ).default([]), // Default to an empty array if no reservations
});

module.exports = userSchema;
