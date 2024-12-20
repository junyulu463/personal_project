import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import axios from 'axios';

const HomePage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [houses, setHouses] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState(null);
  const limit = 10;

  useEffect(() => {
    // Check if there's a logged-in user by decoding the token
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUser(decodedToken.username); // Set the username from token payload
    }
  }, []);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await axios.get('http://localhost:5001/listings/get_all_properties_paginated', {
          params: { page, limit }
        });
        setHouses(response.data.data); // Assuming response.data.data contains the paginated list of houses
        setTotal(response.data.total); // Assuming response.data.total contains the total count of houses
      } catch (error) {
        console.error("Error fetching houses:", error);
      }
    };
    fetchHouses();
  }, [page]);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSearch = () => {
    if (startDate && !endDate) {
      alert("Please input a check-out date.");
      return;
    }
    if (!startDate && endDate) { // Added condition to check if only endDate is provided
      alert("Please input a check-in date.");
      return;
    }
    navigate('/search-results', { state: { location, startDate, endDate, guestCount } });
  };
  

  const handleNextPage = () => {
    if (page < Math.ceil(total / limit)) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handlePropertyClick = (id) => {
    navigate(`/property/${id}`);
  };

  const handleLogout = () => {
    // Clear the token from local storage
    localStorage.removeItem('token');
    setUser(null); // Reset the user state
    // Redirect to login page
    navigate('/');
  };

  const handleReservationHistory = () => {
    if (user) {
      navigate('/reservation-history'); // Navigate to reservation history page
    }
  };

  return (
    <div className="home-page">
      <header className="header">
        <div className="menu">
          <button onClick={handleMenuToggle} className="menu-button">
            Main Menu
          </button>
          {menuOpen && (
            <div className="menu-dropdown">
              <a href="/about">About Us</a>
              <a href="/contact">Contact</a>
              <a href="/listings">Listings</a>
              <a href="/reservations">Reservations</a>
              <a href="/profile">Profile</a>
            </div>
          )}
        </div>    
        <nav className="auth-links">
          {!user ? (
            <>
              <a href="/login">Log In</a>
              <a href="/signup">Sign Up</a>
            </>
          ) : (
            <div className="user-info">
              <span className="user-icon">👤</span> {/* Simple person icon, replace with image if needed */}
              <span>{user}</span>
              <button onClick={handleReservationHistory} className="reservation-history-button">
                🛒 {/* Cart icon for reservation history */}
              </button>
              <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
            </div>
          )}
        </nav>
      </header>

      <h1>Find Your Perfect Stay</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => {
            const newStartDate = e.target.value;
            setStartDate(newStartDate);
            if (endDate && new Date(endDate) < new Date(newStartDate)) {
              setEndDate(''); // Clear the end date
            }
          }}
        />
        <input
          type="date"
          placeholder="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate} // Ensure end date cannot be earlier than start date
        />
        <input
          type="number"
          min="1"
          placeholder="Guests"
          value={guestCount}
          onChange={(e) => setGuestCount(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="house-list">
        {houses.map((house) => (
          <div key={house.id} className="house-card" onClick={() => handlePropertyClick(house.id)}>
            <img src={`http://localhost:5001/${house.main_image}`} alt={house.title} className="house-image" />
            <h3 className="house-title">{house.title}</h3>
            <p className="house-price">${house.price} / night</p>
            <p className="house-type">{house.propertyType}</p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <button onClick={handleNextPage} disabled={page === Math.ceil(total / limit)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default HomePage;
