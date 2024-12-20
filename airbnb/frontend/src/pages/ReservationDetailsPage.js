import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReservationDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Destructure values from state
  const { propertyId, checkInDate, checkOutDate, guestCount, totalAmount } = state || {};

  const [property, setProperty] = useState(null); // State for property details

  // Fetch property details based on propertyId
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/listings/property/${propertyId}`);
        setProperty(response.data); // Set property details in state
      } catch (error) {
        console.error("Error fetching property details:", error);
      }
    };

    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  // Handle missing data
  if (!state) {
    return <div>Error: Reservation details are missing!</div>;
  }

  if (!property) {
    return <div>Loading property details...</div>;
  }

  return (
    <div>
      <h1>Reservation Successful</h1>
      <p><strong>Property:</strong> {property.title}</p>
      <p><strong>Address:</strong> {property.location.address}, {property.location.city}, {property.location.state}</p>
      <p><strong>Check-In Date:</strong> {new Date(checkInDate).toLocaleDateString()}</p>
      <p><strong>Check-Out Date:</strong> {new Date(checkOutDate).toLocaleDateString()}</p>
      <p><strong>Total Guests:</strong> {guestCount}</p>
      <p><strong>Total Price:</strong> ${totalAmount}</p>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
};

export default ReservationDetails;
