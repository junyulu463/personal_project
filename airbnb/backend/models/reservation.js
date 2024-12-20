// backend/models/reservation.js
const Joi = require('joi');

const reservationSchema = Joi.object({
  propertyId: Joi.string().required(),
  username: Joi.string().required(),
  checkInDate: Joi.date().required(),
  checkOutDate: Joi.date().min(Joi.ref('checkInDate')).required(),  
  guestCount: Joi.number().integer().min(1).required(),
  totalAmount: Joi.number().positive().required(),
});

module.exports = reservationSchema;
