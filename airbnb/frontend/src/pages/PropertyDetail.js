// src/pages/PropertyDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PropertyDetail.css';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/listings/property/${id}`);
        setProperty(response.data);
      } catch (error) {
        console.error("Error fetching property details:", error);
      }
    };

    fetchPropertyDetails();
  }, [id]);

  if (!property) return <div>Loading...</div>;

  const getImageTitle = (imagePath) => {
    const parts = imagePath.split('/');
    const fileName = parts[parts.length - 1].split('.')[0];
    return fileName.charAt(0).toUpperCase() + fileName.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const openLightbox = (image) => {
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const decimalPart = rating - fullStars;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <span className="star-container">
        {[...Array(fullStars)].map((_, index) => (
          <span key={`full-${index}`} className="star full">★</span>
        ))}
        {decimalPart > 0 && (
          <span className="star half">
            <span className="half-star-overlay" style={{ width: `${decimalPart * 100}%` }}>★</span>
            ★
          </span>
        )}
        {[...Array(emptyStars)].map((_, index) => (
          <span key={`empty-${index}`} className="star empty">★</span>
        ))}
      </span>
    );
  };

  const handleReserve = () => {
    sessionStorage.setItem('previousPage', `/property/${id}`); // Save the current page
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    if (!token) {
      navigate('/login'); // Redirect to the login page if no token is found
    } else {
      navigate(`/reserve/${id}`); // Redirect to the reservation page if a token exists
    }
  };
  

  return (
    <div className="property-detail">
      <div className="button-container">
        <button onClick={() => navigate('/')}>Go Back to Home Page</button>
        <button onClick={() => navigate('/search-results')}>Go Back to Search Page</button>
      </div>

      <img src={`http://localhost:5001/${property.main_image}`} alt={property.title} className="property-main-image" />
      <h1>{property.title}</h1>
      <p>Price: ${property.price} / night</p>
      <p>Property Type: {property.propertyType}</p>
      <p>Location: {`${property.location.address}, ${property.location.city}, ${property.location.state}, ${property.location.zipcode}`}</p>
      <p>Rating: {renderStars(property.rating)} ({property.rating})</p>
      <p>Max Guests: {property.maxGuests}</p>
      <p>Amenities: {property.amenities.join(", ")}</p>
      <p>Availability: {property.available ? "Available" : "Not Available"}</p>
      <p>From: {property.availableFrom} - To: {property.availableTo}</p>
      <p>Booked Dates:</p>
      <ul>
        {property.bookedDates.length > 0 ? (
          property.bookedDates.map((date, index) => (
            <li key={index}>{new Date(date).toISOString().split('T')[0]}</li>
          ))
        ) : (
          <li>No booked dates yet.</li>
        )}
      </ul>     
      <button onClick={handleReserve} className="reserve-button">Reserve</button>

      <div className="property-images">
        {property.images.map((image, index) => (
          <div key={index} className="property-image-item">
            <img
              src={`http://localhost:5001/${image}`}
              alt={`${property.title} ${index + 1}`}
              className="property-gallery-image"
              onClick={() => openLightbox(image)}
            />
            <p className="image-title">{getImageTitle(image)}</p>
          </div>
        ))}
      </div>

      {lightboxImage && (
        <div className="lightbox" onClick={closeLightbox}>
          <img src={`http://localhost:5001/${lightboxImage}`} alt="Enlarged" className="lightbox-image" />
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
