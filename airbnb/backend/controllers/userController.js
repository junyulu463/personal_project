// backend/controllers/userController.js
const userService = require('../services/userService');
const listingsService = require('../services/listingsService');
const reservationService = require('../services/reservationService');

exports.createMultipleUsers = async (req, res) => {
  const users = req.body.users; // Expect an array of user objects in the request body
  if (!Array.isArray(users)) {
    return res.status(400).json({ error: "Invalid format: Expected an array of users." });
  }

  const results = [];
  for (const userData of users) {
    try {
      const createdUser = await userService.createUser(req.app.locals.esClient, userData);
      results.push({ success: true, user: createdUser });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }

  res.json(results);
};


exports.signup = async (req, res) => {
  const esClient = req.app.locals.esClient;
  try {
    const user = await userService.createUser(esClient, req.body);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



exports.login = async (req, res) => {
  const esClient = req.app.locals.esClient;
  try {
    const token = await userService.authenticateUser(esClient, req.body.username, req.body.password);
    if (token) {
      res.status(200).json({ message: 'Login successful', token });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserReservationData = async (req, res) => {
  const { username } = req.query; // Get the username from the query parameters
  const esClient = req.app.locals.esClient; // Elasticsearch client

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }
  
  try {
    // Get user reservation data
    const userReservations = await userService.getUserReservations(esClient, username);

    if (!userReservations || userReservations.length === 0) {
      return res.status(404).json({ error: "No reservations found for the user" });
    }
    // Fetch property details for each reservation
    const reservationsWithDetails = await Promise.all(
      userReservations.map(async (reservation) => {
        const propertyDetails = await listingsService.getPropertyById(esClient, reservation.propertyId);
        return { ...reservation, propertyDetails };
      })
    );
    
    res.status(200).json(reservationsWithDetails);
  } catch (error) {
    console.error("Error fetching user reservation data:", error.message);
    res.status(500).json({ error: "Failed to fetch user reservation data" });
  }
};

exports.cancelReservation = async (req, res) => {
  const { username, propertyId, checkInDate, checkOutDate } = req.body;
  const esClient = req.app.locals.esClient;

  if (!username || !propertyId || !checkInDate || !checkOutDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Remove the reservation from the user's data
    await userService.removeReservationFromUser(esClient, username, propertyId, checkInDate, checkOutDate);

    // Update the property to remove the canceled dates
    const bookedDates = generateDateRange(new Date(checkInDate), new Date(checkOutDate));
    await listingsService.removeBookedDates(esClient, propertyId, bookedDates);

    // Delete the reservation from the `reservations` index
    await reservationService.deleteReservation(esClient, username, propertyId, checkInDate, checkOutDate);

    res.status(200).json({ message: 'Reservation canceled successfully' });
  } catch (error) {
    console.error('Error canceling reservation:', error);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
};
// Include this function at the top or import it from a utilities file
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};





