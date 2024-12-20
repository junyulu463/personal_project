import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/users/login', { username, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      const previousPage = sessionStorage.getItem('previousPage');
      if (previousPage) {
        sessionStorage.removeItem('previousPage'); // Clear the previous page to avoid repeated redirects
        navigate(previousPage); // Navigate to the previously visited page
      } else {
        navigate('/'); // Default to home if no previous page is stored
      }
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  const handleHomeNavigation = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="home-button-container">
        <button onClick={handleHomeNavigation} className="home-button">Home</button>
      </div>
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Log In</button>
      </form>
    </div>
  );
};

export default LoginPage;
