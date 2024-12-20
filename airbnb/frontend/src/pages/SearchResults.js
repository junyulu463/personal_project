import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { location: initialLocation, startDate: initialStartDate, endDate: initialEndDate, guestCount: initialGuestCount } = location.state || {};

  const [searchLocation, setSearchLocation] = useState(initialLocation || '');
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  const [guestCount, setGuestCount] = useState(initialGuestCount || 1);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [propertyType, setPropertyType] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [filteredHouses, setFilteredHouses] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchFilteredHouses();
  }, [initialLocation, initialStartDate, initialEndDate, initialGuestCount, page]);

  const fetchFilteredHouses = async () => {
    try {
      const response = await axios.get('http://localhost:5001/listings/search', {
        params: {
          location: searchLocation,
          startDate,
          endDate,
          guestCount,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          amenities: selectedAmenities,
          propertyType,
          minRating,
          page,
          limit: 10
        }
      });
      setFilteredHouses(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error("Error fetching filtered houses:", error);
    }
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
    setFilteredHouses([]);
    setPage(1);
    fetchFilteredHouses();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / 10)) {
      setPage(newPage);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const goToPropertyDetail = (id) => {
    navigate(`/property/${id}`);
  };

  const renderStarRating = (rating) => {
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

  return (
    <div className="search-results-page">
      <div className="home_div">
        <button onClick={handleHomeClick} className="home-button">Home</button>
      </div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Location"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
        <input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            // Clear end date if it's earlier than the selected start date
            if (endDate && new Date(e.target.value) > new Date(endDate)) {
              setEndDate('');
            }
          }}
        />
        <input
          type="date"
          placeholder="End Date"
          value={endDate}
          min={startDate} // Restrict available end dates based on start date
          onChange={(e) => setEndDate(e.target.value)}
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

      <div className="search-content">
        <div className="filters-sidebar">
          <h2>Filters</h2>
          <div className="filter-group">
            <label>Price Range:</label>
            <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])} placeholder="Min" />
            <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} placeholder="Max" />
          </div>

          <div className="checkbox-group">
            <label>Amenities:</label>
            {["Wifi", "Kitchen", "Pool"].map((amenity) => (
              <label key={amenity}>
                <input
                  type="checkbox"
                  value={amenity}
                  onChange={(e) => setSelectedAmenities(
                    e.target.checked ? [...selectedAmenities, amenity] : selectedAmenities.filter(a => a !== amenity)
                  )}
                /> {amenity}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <label>Property Type:</label>
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
              <option value="">Any</option>
              <option value="Cottage">Cottage</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Studio">Studio</option>
              <option value="House">House</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Rating:</label>
            <input type="number" min="0" max="5" step="0.1" value={minRating} onChange={(e) => setMinRating(+e.target.value)} placeholder="Min Rating" />
          </div>

          <button onClick={() => {
              if (startDate && !endDate) {
                alert("Please input a check-out date.");
                return;
              }
              if (!startDate && endDate) { // Added condition to check if only endDate is provided
                alert("Please input a check-in date.");
                return;
              }
              handleSearch();
            }} className="apply-button">Apply</button>
        </div>

        <div className="results-container">
          {filteredHouses.length > 0 ? (
            filteredHouses.map(house => (
              <div
                key={house.id}
                className="result-item"
                onClick={() => goToPropertyDetail(house.id)}
              >
                <img src={`http://localhost:5001/${house.main_image}`} alt={house.title} className="result-image" />
                <h3 className="result-title">{house.title}</h3>
                <p>Location: {house.location.city}</p>
                <p>Price: ${house.price}</p>
                <p>propertyType: ${house.propertyType}</p>
                <p>Rating: {renderStarRating(house.rating)}</p>
                <p>Amenities: {house.amenities.join(', ')}</p>
                <p>Available: {house.availableFrom} to {house.availableTo}</p>
                <p>Max Guests: {house.maxGuests}</p>
              </div>
            ))
          ) : (
            <p>No houses found matching your criteria.</p>
          )}
        </div>
      </div>
      <div className="pagination">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
            <span>Page {page} of {Math.ceil(total / 10)}</span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === Math.ceil(total / 10)}>Next</button>
        </div>
    </div>
  );
};

export default SearchResults;
