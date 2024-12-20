// src/pages/SignupPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignupPage.css';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/users/signup', {
        username,
        password,
      });
      alert('Signup successful! You can now log in.');
      navigate('/');
    } catch (error) {
      if (error.response?.data?.error) {
        if (error.response.data.error === 'Username already exists') {
          alert('Username already exists. Please choose a different username.');
        } else {
          alert(`Signup failed: ${error.response.data.error}`);
        }
      } else {
        console.error('Signup failed:', error.message);
      }
    }
  };

  return (
    <div className="signup-container">
      <button onClick={() => navigate('/')} className="home-button">Home</button>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup} className="signup-form">
        <input
          type="text"
          placeholder="Username 3-30 alphanumeric chars"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required  
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
    </div>
  );
};

export default SignupPage;
