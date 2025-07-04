// src/pages/SignUpPage.js

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { ADD_USER,GET_USERS } from '../graphql/userQueries';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  username: "",
  password: "",
  email: "",
  name: "",
  phone: "",
  role: "buyer",
  address: "",         // REMOVE this
  city: "",
  postalCode: "",
  country: "",
};

export default function SignUpPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [addUser] = useMutation(ADD_USER, {
    refetchQueries: [{ query: GET_USERS }]
  });  
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Build addresses array
      const addresses = [{
        address: form.address,
        city: form.city,
        postalCode: form.postalCode,
        country: form.country,
        label: "Default",
        isDefault: true,
      }];

      // Prepare variables (remove raw address fields)
      const { address, city, postalCode, country, ...rest } = form;

      const { data } = await addUser({
        variables: { ...rest, addresses }
      });
      setAuthUser(data.addUser);
      navigate(from);
    } catch (err) {
      if (
        err.message &&
        (err.message.includes("duplicate key error") ||
         err.message.includes("E11000 duplicate key"))
      ) {
        setError("Username or email already exists.");
      } else {
        setError(err.message || "Error signing up.");
      }
    }
  };

  const handleCancel = () => navigate(from);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp} style={{ maxWidth: 350 }}>
        {/* Basic Info... */}
        <input placeholder="Username" name="username" value={form.username} onChange={handleChange} required />
        <input placeholder="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
        <input placeholder="Email" name="email" value={form.email} onChange={handleChange} required />
        <input placeholder="Name" name="name" value={form.name} onChange={handleChange} />
        <input placeholder="Phone" name="phone" value={form.phone} onChange={handleChange} />

        {/* New Address Fields */}
        <input placeholder="Address" name="address" value={form.address} onChange={handleChange} required />
        <input placeholder="City" name="city" value={form.city} onChange={handleChange} required />
        <input placeholder="Postal Code" name="postalCode" value={form.postalCode} onChange={handleChange} required />
        <input placeholder="Country" name="country" value={form.country} onChange={handleChange} required />

        {/* Role dropdown */}
        <label>
          Role:&nbsp;
          <select name="role" value={form.role} onChange={handleChange} style={{ width: 120 }}>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </label>

        <button type="submit" style={{ marginRight: 12 }}>Sign Up</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
      </form>
      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
    </div>
  );
}
