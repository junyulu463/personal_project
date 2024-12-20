import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import './ReservationPage.css';

const ReservationPage = () => {
  const { id } = useParams(); // Property ID
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [availableDates, setAvailableDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [pricePerNight, setPricePerNight] = useState(0);
  const [maxGuests, setMaxGuests] = useState(1);
  const navigate = useNavigate();

  // Fetch property reservation details
  useEffect(() => {
    const fetchPropertyReservationDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/listings/reservation-details/${id}`);
        const { price, maxGuests, availableDates, bookedDates } = response.data;
        setPricePerNight(price);
        setMaxGuests(maxGuests);
        setAvailableDates(availableDates);
        setBookedDates(bookedDates);
      } catch (error) {
        console.error("Error fetching property reservation details:", error);
      }
    };
    fetchPropertyReservationDetails();
  }, [id]);

  const handleReserve = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode the JWT payload
    const username = decodedToken.username;

    try {
      await axios.post('http://localhost:5001/reservations/create', {
        propertyId: id,
        username,
        checkInDate,
        checkOutDate,
        guestCount,
        totalAmount: calculateTotalAmount(),
      });
      navigate('/reservation-details', {
        state: {
          checkInDate,
          checkOutDate,
          guestCount,
          totalAmount: calculateTotalAmount(),
          propertyId: id, // Pass propertyId for fetching property details
        },
      });
    } catch (error) {
      alert('Error creating reservation:', error.response?.data?.error || error.message);
    }
  };

  const calculateTotalAmount = () => {
    if (!checkInDate || !checkOutDate) return 0;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Add 1 to include the check-out day in the stay duration
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) + 1;

    return days * pricePerNight; // Multiply by the price per night
  };

  // Disable dates not in the available dates array
  const isDateAvailable = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return availableDates.includes(dateString);
  };

  // Validate `checkOutDate` to prevent overlaps with `bookedDates`
  const isCheckOutDateValid = (date) => {
    if (!checkInDate) return false;

    const dateString = date.toISOString().split('T')[0];
    const checkInString = checkInDate.toISOString().split('T')[0];

    // Ensure no overlap with booked dates between `checkInDate` and selected `checkOutDate`
    return !bookedDates.some(
      (bookedDate) =>
        new Date(bookedDate) > new Date(checkInString) &&
        new Date(bookedDate) <= new Date(dateString)
    );
  };

  return (
    <div className="reservation-container">
      <h2>Make a Reservation</h2>
      <form onSubmit={handleReserve} className="reservation-form">
        <div className="form-group">
          <label>Check-In Date:</label>
          <DatePicker
            selected={checkInDate}
            onChange={(date) => setCheckInDate(date)}
            filterDate={isDateAvailable}
            minDate={new Date()}
            placeholderText="Select a check-in date"
            required
          />
        </div>
        <div className="form-group">
          <label>Check-Out Date:</label>
          <DatePicker
            selected={checkOutDate}
            onChange={(date) => setCheckOutDate(date)}
            filterDate={isCheckOutDateValid}
            minDate={checkInDate}
            placeholderText="Select a check-out date"
            required
          />
        </div>
        <div className="form-group">
          <label>Guest Count:</label>
          <input
            type="number"
            min="1"
            max={maxGuests} // Restrict guest count to maxGuests
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <p>Total Price: ${calculateTotalAmount() || 0}</p>
        </div>
        <button type="submit" className="reserve-button">Reserve</button>
        <button
          type="button"
          className="back-to-property-button"
          onClick={() => navigate(`/property/${id}`)}
        >
          Back to Property Details
        </button>
      </form>
    </div>
  );
};

export default ReservationPage;
