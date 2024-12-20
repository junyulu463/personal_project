const jwt = require('jsonwebtoken');

// backend/services/userService.js
const bcrypt = require('bcrypt');
const userSchema = require('../models/user');

exports.createUser = async (esClient, userData) => {
  // Validate user data
  const { error } = userSchema.validate(userData);
  if (error) {
    throw new Error(`Invalid input: ${error.details[0].message}`);
  }

  // Check if 'users' index exists and create it if it doesn't
  const indexExists = await esClient.indices.exists({ index: 'users' });
  if (!indexExists) {
    await esClient.indices.create({
      index: 'users',
      body: {
        mappings: {
          properties: {
            username: { type: 'text' }, // Alphanumeric, so text is appropriate
            password: { type: 'text' }, // Plain text password
            email: { type: 'text' }, // Email stored as text
            reservationData: {
              type: 'nested', // Array of reservation objects
              properties: {
                propertyId: { type: 'text' }, // Property ID
                checkInDate: { type: 'date' }, // Check-in date
                checkOutDate: { type: 'date' }, // Check-out date
              }
            }
          }
        }
      }
    });
  }

  // Check if the user already exists
  const existingUser = await esClient.search({
    index: 'users',
    body: {
      query: {
        match: { username: userData.username },
      },
    },
  });

  if (existingUser.hits.hits.length > 0) {
    throw new Error('Username already exists');
  }

  // Hash password and save user
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = { ...userData, password: hashedPassword };

  // Index the new user with 'create' op_type to avoid duplicates
  await esClient.index({
    index: 'users',
    document: user,
    op_type: 'create', // Only create if it doesn't already exist
  });

  return user;
};



exports.authenticateUser = async (esClient, username, password) => {
  const result = await esClient.search({
    index: 'users',
    body: {
      query: {
        match: { username }
      }
    }
  });

  const user = result.hits.hits[0]?._source;
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  const token = jwt.sign({ username: user.username }, 'secretKey', { expiresIn: '1h' });
  return token;
};

exports.addReservationToUser = async (esClient, username, reservation) => {
  try {
    // Fetch the user document by username
    const result = await esClient.search({
      index: 'users',
      body: {
        query: { match: { username } }
      }
    });

    if (result.hits.total.value === 0) {
      throw new Error('User not found');
    }

    const userId = result.hits.hits[0]._id; // Get the user's document ID
    const user = result.hits.hits[0]._source; // Get the user's data

    // Add the new reservation (propertyId, checkInDate, and checkOutDate) to reservationData
    const updatedReservations = [
      ...(user.reservationData || []),
      {
        propertyId: reservation.propertyId,
        checkInDate: reservation.checkInDate,
        checkOutDate: reservation.checkOutDate,
      },
    ];

    // Update the user's reservationData in Elasticsearch
    await esClient.update({
      index: 'users',
      id: userId,
      body: {
        doc: {
          reservationData: updatedReservations,
        }
      }
    });
  } catch (error) {
    console.error('Error adding reservation to user:', error.message);
    throw new Error('Failed to add reservation to user');
  }
};


exports.getUserReservations = async (esClient, username) => {
  try {
    const result = await esClient.search({
      index: 'users',
      body: {
        query: {
          match: { username },
        },
      },
    });

    if (result.hits.total.value === 0) {
      throw new Error('User not found');
    }

    // Extract user reservation data
    const user = result.hits.hits[0]._source;
    return user.reservationData || [];
  } catch (error) {
    console.error('Error fetching user reservations:', error.message);
    throw new Error('Failed to fetch user reservations');
  }
};

exports.removeReservationFromUser = async (esClient, username, propertyId, checkInDate, checkOutDate) => {
  try {
    // Search for the user document
    const result = await esClient.search({
      index: 'users',
      body: {
        query: { match: { username } }
      }
    });

    if (result.hits.total.value === 0) {
      throw new Error('User not found');
    }

    const userId = result.hits.hits[0]._id;
    const user = result.hits.hits[0]._source;

    // Filter out the reservation that matches propertyId, checkInDate, and checkOutDate
    const updatedReservations = user.reservationData.filter(
      (reservation) =>
        !(
          reservation.propertyId === propertyId &&
          reservation.checkInDate === checkInDate &&
          reservation.checkOutDate === checkOutDate
        )
    );

    // Update the user document in Elasticsearch
    await esClient.update({
      index: 'users',
      id: userId,
      body: {
        doc: { reservationData: updatedReservations }
      }
    });
  } catch (error) {
    console.error('Error removing reservation from user:', error);
    throw new Error('Failed to remove reservation from user');
  }
};
