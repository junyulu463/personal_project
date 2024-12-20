// services/listingsService.js
const houseSchema = require('../models/house'); // Import the Joi schema from house.js

exports.createIndex = async (esClient, listingData) => {
  const indexName = 'properties';

  // Validate listingData against the house.js schema
  const { error, value } = houseSchema.validate(listingData);
  if (error) {
    throw new Error(`Validation failed: ${error.details[0].message}`);
  }

  // Delete index if it already exists (optional)
  await esClient.indices.delete({ index: indexName }, { ignore: [404] });

  // Create the index with mappings for all fields based on house.js schema
  return await esClient.indices.create({
    index: indexName,
    body: {
      mappings: {
        properties: {
          title: { type: 'text' },
          main_image: { type: 'text' },
          images: { type: 'text' }, // Array of image paths as text
          location: {
            properties: {
              state: { type: 'text' },
              city: { type: 'text' },
              zipcode: { type: 'text' },
              address: { type: 'text' }
            }
          },
          price: { type: 'float' },
          amenities: { type: 'text' }, // Array of amenities as text
          propertyType: { type: 'text' },
          rating: { type: 'float' },
          availableFrom: { type: 'date' },
          availableTo: { type: 'date' },
          maxGuests: { type: 'integer' },
          bookedDates: { type: 'date' }, // Array of dates
          contactInfo: {
            properties: {
              email: { type: 'text' },
              phoneNumber: { type: 'text' },
              website: { type: 'text' }
            }
          }
        }
      }
    }
  });
};

// services/listingsService.js
exports.createListing = async (esClient, listingData) => {
  const {
    title,
    main_image,
    images,
    location,
    price,
    amenities,
    propertyType,
    rating,
    availableFrom,
    availableTo,
    maxGuests,
    bookedDates,
    contactInfo
  } = listingData;

  return await esClient.index({
    index: 'properties',
    body: {
      title,
      main_image,
      images,
      location,
      price,
      amenities,
      propertyType,
      rating,
      availableFrom,
      availableTo,
      maxGuests,
      bookedDates, // Include bookedDates array
      contactInfo  // Include contactInfo object
    }
  });
};

// Service function to fetch properties with pagination
exports.getAllPropertiesWithPagination = async (esClient, page, limit) => {
  const result = await esClient.search({
    index: 'properties',
    body: {
      _source: ['title', 'main_image', 'price', 'propertyType'], // Retrieve title, main image, price, and property type fields
      query: {
        match_all: {} // Match all properties without filtering
      },
      from: (page - 1) * limit, // Calculate the starting document for the page
      size: limit // Limit the number of documents per page
    }
  });

  // Map the result to include `_id` as `id` in each document
  return {
    data: result.hits.hits.map(hit => ({
      id: hit._id, // Include document ID as `id`
      ...hit._source // Spread the rest of the source data
    })),
    total: result.hits.total.value // Total count of documents for pagination
  };
};


// Get a listing by ID
exports.getPropertyById = async (esClient, id) => { // Use `id` instead of `propertyId`
  const result = await esClient.get({
    index: 'properties',
    id: id
  });
  return result._source; // Return the full property details
};

// Service function for searching properties with multiple filters and pagination
exports.searchProperties = async (esClient, filters) => {
  const {
    location,
    startDate,
    endDate,
    guestCount,
    minPrice,
    maxPrice,
    amenities,
    propertyType,
    minRating,
    page,
    limit,
  } = filters;

  const must = [];
  const must_not = []; // Array for must_not conditions

  if (location) {
    must.push({ match_phrase_prefix: { "location.city": location } });
  }

  if (startDate && endDate) {
    must.push(
      {
        range: {
          availableFrom: { lte: startDate }, // availableFrom should be less than or equal to startDate
        },
      },
      {
        range: {
          availableTo: { gte: endDate }, // availableTo should be greater than or equal to endDate
        },
      }
    );

    // Exclude properties that have overlapping booked dates
    must_not.push({
      range: {
        bookedDates: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  if (guestCount) {
    must.push({ range: { maxGuests: { gte: guestCount } } });
  }

  if (minPrice || maxPrice) {
    must.push({
      range: { price: { gte: minPrice || 0, lte: maxPrice || 1000 } },
    });
  }

  if (amenities && amenities.length > 0) {
    amenities.forEach((amenity) => {
      must.push({ match: { amenities: amenity } });
    });
  }

  if (propertyType) {
    must.push({ match: { propertyType } });
  }

  if (minRating) {
    must.push({ range: { rating: { gte: minRating } } });
  }

  const result = await esClient.search({
    index: 'properties',
    body: {
      query: { bool: { must, must_not } },
      _source: [
        'title',
        'main_image',
        'price',
        'propertyType',
        'location',
        'rating',
        'availableFrom',
        'availableTo',
        'maxGuests',
        'amenities',
        'bookedDates',
        'contactInfo',
      ],
      from: (page - 1) * limit, // Calculate the starting document for the page
      size: limit, // Set the number of documents to retrieve per page
    },
  });

  return {
    data: result.hits.hits.map((hit) => ({
      id: hit._id,
      ...hit._source,
    })),
    total: result.hits.total.value, // Return the total number of matching documents
  };
};


// Helper function to generate a range of dates
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dates.push(currentDate.toISOString().split('T')[0]); // Add only the date part
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Update a listing by ID
exports.updateListing = async (esClient, id, updateData) => {
  return await esClient.update({
    index: 'properties',
    id: id,
    body: {
      doc: updateData // Pass the full updateData object to handle partial updates
    }
  });
};

// Delete a listing by ID
exports.deleteListing = async (esClient, id) => {
  return await esClient.delete({
    index: 'properties',
    id: id
  });
};

exports.removeBookedDates = async (esClient, propertyId, bookedDates) => {
  try {
    // Retrieve the property
    const result = await esClient.get({
      index: 'properties',
      id: propertyId
    });

    const property = result._source;

    // Remove the specified booked dates from the property
    const remainingDates = property.bookedDates.filter(
      (date) => !bookedDates.includes(date)
    );

    // Update the property document in Elasticsearch
    await esClient.update({
      index: 'properties',
      id: propertyId,
      body: {
        doc: { bookedDates: remainingDates }
      }
    });
  } catch (error) {
    console.error('Error removing booked dates from property:', error);
    throw new Error('Failed to remove booked dates from property');
  }
};



