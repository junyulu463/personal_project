// backend/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/signup/multiple', userController.createMultipleUsers);
router.get('/reservations', userController.getUserReservationData);
router.delete('/cancel-reservation', userController.cancelReservation);


module.exports = router;
