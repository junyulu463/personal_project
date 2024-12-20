import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import PropertyDetail from './pages/PropertyDetail'; // Import the PropertyDetail component
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ReservationPage from './pages/ReservationPage';
import ReservationDetailsPage from './pages/ReservationDetailsPage';
import ReservationHistory from './pages/ReservationHistory';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/property/:id" element={<PropertyDetail />} /> {/* Add this route for property details */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reserve/:id" element={<ReservationPage />} />
        <Route path="/reservation-details" element={<ReservationDetailsPage />} />
        <Route path="/reservation-history" element={<ReservationHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
