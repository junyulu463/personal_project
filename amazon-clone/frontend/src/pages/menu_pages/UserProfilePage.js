import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, UPDATE_USER } from '../../graphql/userQueries';

// --- NEW: Address Mutations ---
import {
  ADD_ADDRESS,
  UPDATE_ADDRESS,
  DELETE_ADDRESS,
  SET_DEFAULT_SHIPPING_ADDRESS,
  SET_DEFAULT_BILLING_ADDRESS
} from '../../graphql/userQueries'; // you need to define these if not already

export default function UserProfilePage() {
  const { authUser, setAuthUser } = useAuth();
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    fetchPolicy: 'network-only',
    skip: !authUser?._id,
  });

  const [updateUser] = useMutation(UPDATE_USER);
  // --- NEW: Address Mutations
  const [addAddress] = useMutation(ADD_ADDRESS, { onCompleted: refetch });
  const [updateAddress] = useMutation(UPDATE_ADDRESS, { onCompleted: refetch });
  const [deleteAddress] = useMutation(DELETE_ADDRESS, { onCompleted: refetch });
  const [setDefaultShipping] = useMutation(SET_DEFAULT_SHIPPING_ADDRESS, { onCompleted: refetch });
  const [setDefaultBilling] = useMutation(SET_DEFAULT_BILLING_ADDRESS, { onCompleted: refetch });

  const currentUser = data?.getUsers?.find(u => u._id === authUser?._id);

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // --- NEW: Address Edit State
  const [addressEditIdx, setAddressEditIdx] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    recipient: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    isDefault: false,
    isBilling: false
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || ""
      });
    }
  }, [currentUser]);

  if (!authUser) return <div style={{ padding: 32 }}>Please log in to view your profile.</div>;
  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', padding: 32 }}>Error: {error.message}</div>;
  if (!currentUser) return <div style={{ padding: 32 }}>User not found.</div>;

  const handleEdit = () => { setEditMode(true); setMessage(""); };
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: currentUser.name || "",
      email: currentUser.email || "",
      phone: currentUser.phone || ""
    });
    setMessage('');
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // --- NEW: Address Handlers ---
  const openAddressEdit = (idx) => {
    setAddressEditIdx(idx);
    if (idx === -1) {
      setAddressForm({
        label: "",
        recipient: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        isDefault: false,
        isBilling: false
      });
    } else {
      const addr = currentUser.addresses[idx];
      setAddressForm({ ...addr });
    }
  };

  const handleAddressFormChange = e => {
    const { name, value, type, checked } = e.target;
    setAddressForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveAddress = async e => {
    e.preventDefault();
    if (addressEditIdx === -1) {
      // Add
      await addAddress({ variables: { userId: currentUser._id, address: addressForm } });
    } else {
      // Update
      await updateAddress({ variables: { userId: currentUser._id, addressId: currentUser.addresses[addressEditIdx]._id, address: addressForm } });
    }
    setAddressEditIdx(null);
    setAddressForm({
      label: "",
      recipient: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      isDefault: false,
      isBilling: false
    });
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Delete this address?")) {
      await deleteAddress({ variables: { userId: currentUser._id, addressId } });
    }
  };

  const handleSetDefaultShipping = async (addressId) => {
    await setDefaultShipping({ variables: { userId: currentUser._id, addressId } });
  };

  const handleSetDefaultBilling = async (addressId) => {
    await setDefaultBilling({ variables: { userId: currentUser._id, addressId } });
  };

  // --- END NEW ---

  const handleSave = async e => {
    e.preventDefault();
    try {
      const res = await updateUser({
        variables: {
          id: currentUser._id,
          ...form
        }
      });
      setEditMode(false);
      setMessage('Profile updated!');
      setAuthUser(prev => ({ ...prev, ...res.data.updateUser }));
      refetch();
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(err.message || "Failed to update profile.");
    }
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: 480,
      margin: '40px auto',
      background: "#fafbfc",
      borderRadius: 10,
      boxShadow: "0 2px 16px 0 #eee"
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 4,
          padding: '8px 16px',
          marginBottom: 24,
          cursor: 'pointer'
        }}
      >
        ← Back
      </button>

      <h2>👤 User Profile</h2>
      {editMode ? (
        <form onSubmit={handleSave}>
          {/* ...your existing table for user fields, minus address... */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Username:</td>
                <td style={{ padding: "8px 0" }}>{currentUser.username}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Email:</td>
                <td style={{ padding: "8px 0" }}>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Name:</td>
                <td style={{ padding: "8px 0" }}>
                  <input type="text" name="name" value={form.name} onChange={handleChange} />
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Phone:</td>
                <td style={{ padding: "8px 0" }}>
                  <input type="text" name="phone" value={form.phone} onChange={handleChange} />
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Role:</td>
                <td style={{ padding: "8px 0" }}>{currentUser.role}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 20 }}>
            <button
              type="submit"
              style={{
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "8px 20px",
                marginRight: 12,
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                background: "#fff",
                color: "#1976d2",
                border: "1px solid #1976d2",
                borderRadius: 4,
                padding: "8px 20px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Username:</td>
                <td style={{ padding: "8px 0" }}>{currentUser.username}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Email:</td>
                <td style={{ padding: "8px 0" }}>{currentUser.email}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Name:</td>
                <td style={{ padding: "8px 0" }}>{currentUser.name || <i>(not set)</i>}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Phone:</td>
                <td style={{ padding: "8px 0" }}>{currentUser.phone || <i>(not set)</i>}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Role:</td>
                <td style={{ padding: "8px 0" }}>{currentUser.role}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 20 }}>
            <button
              type="button"
              onClick={handleEdit}
              style={{
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "8px 20px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Edit Profile
            </button>
          </div>
        </>
      )}

      {/* ---- NEW: ADDRESS MANAGEMENT ---- */}
      <h3 style={{ marginTop: 36 }}>Addresses</h3>
      <ul>
        {currentUser.addresses?.map((addr, i) => (
          <li key={addr._id} style={{ marginBottom: 14, border: "1px solid #eee", borderRadius: 6, padding: 8 }}>
            <div>
              <b>{addr.label || "Address"}:</b> {addr.address}, {addr.city}, {addr.country}
              {addr.isDefault && <span style={{ color: "green" }}> (Default Shipping)</span>}
              {addr.isBilling && <span style={{ color: "blue" }}> (Billing)</span>}
            </div>
            <div>
              <button onClick={() => openAddressEdit(i)} style={{ marginRight: 6 }}>Edit</button>
              <button onClick={() => handleDeleteAddress(addr._id)} style={{ marginRight: 6 }}>Delete</button>
              <button onClick={() => handleSetDefaultShipping(addr._id)} style={{ marginRight: 6 }}>Set as Default Shipping</button>
              <button onClick={() => handleSetDefaultBilling(addr._id)}>Set as Default Billing</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => openAddressEdit(-1)}>Add Address</button>
      {addressEditIdx !== null && (
        <form onSubmit={handleSaveAddress} style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 6, padding: 14 }}>
          <h4>{addressEditIdx === -1 ? "Add Address" : "Edit Address"}</h4>
          <input name="label" placeholder="Label" value={addressForm.label} onChange={handleAddressFormChange} style={{ marginBottom: 6 }} />
          <input name="recipient" placeholder="Recipient" value={addressForm.recipient} onChange={handleAddressFormChange} style={{ marginBottom: 6 }} />
          <input name="address" placeholder="Address" value={addressForm.address} onChange={handleAddressFormChange} style={{ marginBottom: 6 }} required />
          <input name="city" placeholder="City" value={addressForm.city} onChange={handleAddressFormChange} style={{ marginBottom: 6 }} required />
          <input name="postalCode" placeholder="Postal Code" value={addressForm.postalCode} onChange={handleAddressFormChange} style={{ marginBottom: 6 }} required />
          <input name="country" placeholder="Country" value={addressForm.country} onChange={handleAddressFormChange} style={{ marginBottom: 6 }} required />
          <label>
            <input
              type="checkbox"
              name="isDefault"
              checked={addressForm.isDefault}
              onChange={handleAddressFormChange}
            />
            Default Shipping
          </label>
          <label>
            <input
              type="checkbox"
              name="isBilling"
              checked={addressForm.isBilling}
              onChange={handleAddressFormChange}
            />
            Billing Address
          </label>
          <div style={{ marginTop: 8 }}>
            <button type="submit">{addressEditIdx === -1 ? "Add" : "Save"}</button>
            <button type="button" onClick={() => setAddressEditIdx(null)} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </form>
      )}
      {/* ---- END ADDRESS ---- */}

      {message && (
        <div style={{ marginTop: 18, color: "#1976d2" }}>
          {message}
        </div>
      )}
    </div>
  );
}
