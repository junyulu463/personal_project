// backend/controllers/reservationController.js
const reservationService = require('../services/reservationService');
const userService = require('../services/userService');
const listingsService = require('../services/listingsService');


exports.createReservation = async (req, res) => {
  const { propertyId, username, checkInDate, checkOutDate, guestCount, totalAmount } = req.body;
  const esClient = req.app.locals.esClient; // Retrieve Elasticsearch client

  if (!propertyId || !username || !checkInDate || !checkOutDate || !guestCount || !totalAmount) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Prepare reservation data
    const reservationData = { propertyId, username, checkInDate, checkOutDate, guestCount, totalAmount };

    // Create the reservation in Elasticsearch
    await reservationService.createReservation(esClient, reservationData);

    // Add the reservation to the user's data in Elasticsearch
    await userService.addReservationToUser(esClient, username, {
      propertyId,
      checkInDate,
      checkOutDate,
    });

    // Fetch the current property details
    const property = await listingsService.getPropertyById(esClient, propertyId);

    // Merge new booked dates with existing ones
    const bookedDates = generateDateRange(new Date(checkInDate), new Date(checkOutDate));
    const existingBookedDates = property.bookedDates || [];
    const updatedBookedDates = [...new Set([...existingBookedDates, ...bookedDates])];

    // Update the property's bookedDates using the service
    await listingsService.updateListing(esClient, propertyId, { bookedDates: updatedBookedDates });

    res.status(201).json({ message: 'Reservation successful!' });
  } catch (error) {
    console.error("Error creating reservation:", error.message);
    res.status(500).json({ error: error.message || 'Failed to create reservation' });
  }
};



const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 1); // Increment by one day
  }

  return dates;
};


