const Joi = require('joi');
const listingsService = require('../services/listingsService');
const houseSchema = require('../models/house');

exports.createIndex = async (req, res) => {
  try {
    await listingsService.createIndex(req.app.locals.esClient);
    res.status(201).json({ success: true, message: 'Index created with rating mapped as float.' });
  } catch (error) {
    console.error('Error creating index:', error);
    res.status(500).json({ error: 'Failed to create index.' });
  }
};


exports.bulkCreateListings = async (req, res) => {
  const listings = req.body;

  // Check if the incoming data is an array
  if (!Array.isArray(listings)) {
    return res.status(400).json({ error: "Data must be an array of listings" });
  }

  try {
    // Process each listing in the array using the service function
    const results = await Promise.all(
      listings.map(listing => listingsService.createListing(req.app.locals.esClient, listing))
    );
    res.status(201).json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller function to fetch paginated properties with limited fields
exports.getAllPropertiesWithPagination = async (req, res) => {
  try {
    // Extract the page and limit query parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not provided

    // Call the service function to fetch properties with pagination
    const { data, total } = await listingsService.getAllPropertiesWithPagination(req.app.locals.esClient, page, limit);

    // Send the paginated data and total count back to the client
    res.status(200).json({ data, total });
  } catch (error) {
    console.error("Error fetching paginated property data:", error);
    res.status(500).json({ error: "Failed to fetch paginated property data" });
  }
};

// Get a listing by ID
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params; // Use `id` instead of `propertyId`
    const property = await listingsService.getPropertyById(req.app.locals.esClient, id);
    res.status(200).json(property);
  } catch (error) {
    console.error("Error fetching property by ID:", error);
    res.status(500).json({ error: "Failed to fetch property details" });
  }
};

// Controller function for searching properties based on filters with pagination
exports.searchProperties = async (req, res) => {
  try {
    const { location, startDate, endDate, guestCount, minPrice, maxPrice, amenities, propertyType, minRating, page = 1, limit = 10 } = req.query;

    // Call the service function with filter parameters and pagination
    const { data, total } = await listingsService.searchProperties(req.app.locals.esClient, {
      location,
      startDate,
      endDate,
      guestCount,
      minPrice,
      maxPrice,
      amenities: Array.isArray(amenities) ? amenities : amenities ? [amenities] : [],
      propertyType,
      minRating,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });

    // Send paginated search results and total count back to the client
    res.status(200).json({ data, total });
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
};

// Create a new single listing
exports.createListing = async (req, res) => {
  const { error } = houseSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const result = await listingsService.createListing(req.app.locals.esClient, req.body);
    res.status(201).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a listing
exports.updateListing = async (req, res) => {
  const { id } = req.params;
  
  // Validate request body for update
  const { error } = houseSchema.validate(req.body, { allowUnknown: true });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const result = await listingsService.updateListing(req.app.locals.esClient, id, req.body);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a listing
exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await listingsService.deleteListing(req.app.locals.esClient, id);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New function to fetch property reservation details
exports.getPropertyReservationDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await listingsService.getPropertyById(req.app.locals.esClient, id);
    const { price, maxGuests, bookedDates, availableFrom, availableTo } = property;

    // Generate available dates
    const allDates = generateDateRange(new Date(availableFrom), new Date(availableTo));
    const availableDates = allDates.filter(date => !bookedDates.includes(date));

    res.json({ price, maxGuests, availableDates, bookedDates });
  } catch (error) {
    console.error("Error fetching property reservation details:", error);
    res.status(500).json({ error: "Failed to fetch property reservation details" });
  }
};

// Utility function to generate a range of dates between two dates
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]); // Format date as YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 1); // Increment by one day
  }

  return dates;
};



  
