import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '../graphql/userQueries';
import { useAuth } from '../context/AuthContext';

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

    // Find user by username/password
    const foundUser = data.getUsers.find(
      u => u.username === username && u.password === password
    );
    if (foundUser) {
      // Save only the fields you want in auth context
      setAuthUser({
        _id: foundUser._id,
        username: foundUser.username,
        role: foundUser.role,         // Make sure your GET_USERS returns "role"
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
    <div style={{ padding: "2rem" }}>
      <h2>Log In</h2>
      <form onSubmit={handleLogin} style={{ maxWidth: 350 }}>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required style={{ display: "block", margin: "1rem 0" }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required style={{ display: "block", margin: "1rem 0" }}
        />
        <button type="submit" style={{ marginRight: 12 }}>Log In</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
      </form>
      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
    </div>
  );
}
