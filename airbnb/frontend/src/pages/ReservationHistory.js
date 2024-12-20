import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ReservationHistory.css';
import { useNavigate } from 'react-router-dom';

const ReservationHistory = () => {
  const [reservations, setReservations] = useState([]);
  const [propertyDetails, setPropertyDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert('Please log in to view reservation history');
      return;
    }

    const fetchReservationHistory = async () => {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const username = decodedToken.username;

        const response = await axios.get(`http://localhost:5001/users/reservations`, {
          params: { username },
        });

        const reservations = response.data;
        setReservations(reservations);

        // Fetch property details for all reserved properties
        const propertyPromises = reservations.map((reservation) =>
          axios.get(`http://localhost:5001/listings/property/${reservation.propertyId}`)
        );

        const propertyResponses = await Promise.all(propertyPromises);

        const propertyData = {};
        propertyResponses.forEach((res, index) => {
          propertyData[reservations[index].propertyId] = res.data;
        });

        setPropertyDetails(propertyData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reservation history:', error);
      }
    };

    fetchReservationHistory();
  }, [token]);

  const handleCancelReservation = async (reservation) => {
    try {
      const { propertyId, checkInDate, checkOutDate } = reservation;
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const username = decodedToken.username; // Extract the username from the token

      await axios.delete(`http://localhost:5001/users/cancel-reservation`, {
        data: { username, propertyId, checkInDate, checkOutDate }, // Pass the correct fields
      });

      alert('Reservation canceled successfully!');

      // Remove the reservation from the UI
      setReservations((prevReservations) =>
        prevReservations.filter(
          (res) =>
            !(
              res.propertyId === propertyId &&
              res.checkInDate === checkInDate &&
              res.checkOutDate === checkOutDate
            )
        )
      );
    } catch (error) {
      console.error('Error canceling reservation:', error);
      alert('Failed to cancel reservation.');
    }
  };

  const calculateTotalNights = (checkInDate, checkOutDate) => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) + 1; // Include check-out day
  };

  if (loading) {
    return <div className="reservation-history-loading">Loading your reservation history...</div>;
  }

  if (reservations.length === 0) {
    return (
      <div className="reservation-history-empty">
        <p>No reservations found.</p>
        <button className="back-to-home-button" onClick={() => navigate('/')}>
          Go Back to Home Page
        </button>
      </div>
    );
  }

  return (
    <div className="reservation-history-container">
      <h2>Your Reservation History</h2>
      {reservations.map((reservation, index) => {
        const property = propertyDetails[reservation.propertyId];
        return (
          <div key={index} className="reservation-history-card">
            {property ? (
              <>
                <img
                  src={`http://localhost:5001/${property.main_image}`}
                  alt={property.title}
                  className="property-image"
                />
                <h3>{property.title}</h3>
                <p>
                  {property.location.address}, {property.location.city},{' '}
                  {property.location.state}, {property.location.zipcode}
                </p>
                <p>
                  <strong>Price:</strong> ${property.price} / night
                </p>
                <p>
                  <strong>Property Type:</strong> {property.propertyType}
                </p>
              </>
            ) : (
              <p>Property details not available.</p>
            )}
            <div className="reservation-details">
              <h4>Reservation Details</h4>
              <p>
                <strong>Check-In Date:</strong> {reservation.checkInDate.split('T')[0]}
              </p>
              <p>
                <strong>Check-Out Date:</strong> {reservation.checkOutDate.split('T')[0]}
              </p>
              <p>
                <strong>Total Nights:</strong>{' '}
                {calculateTotalNights(reservation.checkInDate, reservation.checkOutDate)}
              </p>
              <button
                className="cancel-reservation-button"
                onClick={() => handleCancelReservation(reservation)}
              >
                Cancel Reservation
              </button>
            </div>
          </div>
        );
      })}
      <button className="back-to-home-button" onClick={() => navigate('/')}>
        Go Back to Home Page
      </button>
    </div>
  );
};

export default ReservationHistory;
