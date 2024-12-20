// backend/services/reservationService.js
const reservationSchema = require('../models/reservation');

exports.createReservation = async (esClient, reservationData) => {
  const { error } = reservationSchema.validate(reservationData);
  if (error) throw new Error(error.details[0].message);

  // Index the reservation data in Elasticsearch
  const response = await esClient.index({
    index: 'reservations',
    document: reservationData,
  });

  return response;
};

exports.deleteReservation = async (esClient, username, propertyId, checkInDate, checkOutDate) => {
  try {
    // Search for the reservation
    const result = await esClient.search({
      index: 'reservations',
      body: {
        query: {
          bool: {
            must: [
              { match: { username } },
              { match: { propertyId } },
              { match: { checkInDate } },
              { match: { checkOutDate } }
            ]
          }
        }
      }
    });

    if (result.hits.total.value === 0) {
      throw new Error('Reservation not found');
    }

    const reservationId = result.hits.hits[0]._id;

    // Delete the reservation
    console.log('Deleting reservation with ID:', reservationId);
    await esClient.delete({
      index: 'reservations',
      id: reservationId
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw new Error('Failed to delete reservation');
  }
};
