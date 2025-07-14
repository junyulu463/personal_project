import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '../graphql/userQueries';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css'; // Import the CSS

export default function LoginPage() {
  const { setAuthUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useQuery(GET_USERS);

  const from = location.state?.from || '/';

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!data || !data.getUsers) {
      setError("User data not loaded.");
      return;
    }

    const foundUser = data.getUsers.find(
      u => u.username === username && u.password === password
    );
    if (foundUser) {
      setAuthUser({
        _id: foundUser._id,
        username: foundUser.username,
        role: foundUser.role,
        name: foundUser.name,
        email: foundUser.email,
      });
      navigate(from);
    } else {
      setError("Invalid username or password.");
    }
  };

  const handleCancel = () => navigate(from);

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="login-title">Log In</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            className="login-input"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
          />
          <input
            className="login-input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="login-actions">
            <button className="login-btn" type="submit">Log In</button>
            <button className="login-btn secondary" type="button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
}
