const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');

// CRUD routes
router.post('/create-index', listingsController.createIndex);
router.post('/bulk-create', listingsController.bulkCreateListings);
router.get('/get_all_properties_paginated', listingsController.getAllPropertiesWithPagination);
router.get('/search', listingsController.searchProperties);
router.post('/createListing', listingsController.createListing);
router.get('/property/:id', listingsController.getPropertyById);
router.put('/:id', listingsController.updateListing);
router.delete('/:id', listingsController.deleteListing);
router.get('/reservation-details/:id', listingsController.getPropertyReservationDetails);

module.exports = router;
