import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { ADD_USER, GET_USERS } from '../graphql/userQueries';
import { useAuth } from '../context/AuthContext';
import '../styles/SignUpPage.css';

const initialForm = {
  username: "",
  password: "",
  email: "",
  name: "",
  phone: "",
  role: "buyer",
  street: "",
  city: "",
  country: "",
  postalCode: "",
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

    // Combine address fields
    const addressParts = [
      form.street,
      form.city,
      form.country,
      form.postalCode
    ].filter(Boolean);
    const address = addressParts.join(', ');

    try {
      const { street, city, country, postalCode, ...rest } = form;
      const { data } = await addUser({
        variables: {
          ...rest,
          address,
          shippingAddresses: [],
          billingAddresses: [],
          paymentMethods: [],
        }
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
    <div className="signup-bg">
      <div className="signup-card">
        <h2 className="signup-title">Sign Up</h2>
        <form className="signup-form" onSubmit={handleSignUp}>
          {/* Basic Info */}
          <input className="signup-input" placeholder="Username" name="username" value={form.username} onChange={handleChange} required />
          <input className="signup-input" placeholder="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
          <input className="signup-input" placeholder="Email" name="email" value={form.email} onChange={handleChange} required />
          <input className="signup-input" placeholder="Name" name="name" value={form.name} onChange={handleChange} />
          <input className="signup-input" placeholder="Phone" name="phone" value={form.phone} onChange={handleChange} />

          {/* Address Fields */}
          <div className="signup-address-block">
            <h3 className="signup-address-title">Address:</h3>
            <input className="signup-input" placeholder="Street Address" name="street" value={form.street} onChange={handleChange} required />
            <input className="signup-input" placeholder="City" name="city" value={form.city} onChange={handleChange} required />
            <input className="signup-input" placeholder="Country" name="country" value={form.country} onChange={handleChange} required />
            <input className="signup-input" placeholder="Postal Code" name="postalCode" value={form.postalCode} onChange={handleChange} required />
          </div>

          {/* Role dropdown */}
          <div className="signup-role-block">
            <label>
              Role:&nbsp;
              <select className="signup-select" name="role" value={form.role} onChange={handleChange}>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </label>
          </div>

          <div className="signup-actions">
            <button className="signup-btn" type="submit">Sign Up</button>
            <button className="signup-btn secondary" type="button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
        {error && <div className="signup-error">{error}</div>}
      </div>
    </div>
  );
}
