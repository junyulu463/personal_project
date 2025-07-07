// src/pages/profile/UserProfilePage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, UPDATE_USER } from '../../graphql/userQueries';
import AddressForm from './components/AddressForm.js';
import CardTypeSelector from './components/CardTypeSelector';

// ---- Address/Billing/Shipping Mutations ----
import {
  ADD_SHIPPING_ADDRESS,
  UPDATE_SHIPPING_ADDRESS,
  DELETE_SHIPPING_ADDRESS,
  SET_DEFAULT_SHIPPING_ADDRESS,
  ADD_BILLING_ADDRESS,
  UPDATE_BILLING_ADDRESS,
  DELETE_BILLING_ADDRESS,
  SET_DEFAULT_BILLING_ADDRESS,
  ADD_PAYMENT_METHOD,
  UPDATE_PAYMENT_METHOD,
  DELETE_PAYMENT_METHOD,
  SET_DEFAULT_PAYMENT_METHOD
} from '../../graphql/userQueries';

export default function UserProfilePage() {
  const { authUser, setAuthUser } = useAuth();
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    fetchPolicy: 'network-only',
    skip: !authUser?._id,
  });

  const [updateUser] = useMutation(UPDATE_USER);

  // Address Mutations
  const [addShippingAddress] = useMutation(ADD_SHIPPING_ADDRESS, { onCompleted: refetch });
  const [updateShippingAddress] = useMutation(UPDATE_SHIPPING_ADDRESS, { onCompleted: refetch });
  const [deleteShippingAddress] = useMutation(DELETE_SHIPPING_ADDRESS, { onCompleted: refetch });
  const [setDefaultShipping] = useMutation(SET_DEFAULT_SHIPPING_ADDRESS, { onCompleted: refetch });

  const [addBillingAddress] = useMutation(ADD_BILLING_ADDRESS, { onCompleted: refetch });
  const [updateBillingAddress] = useMutation(UPDATE_BILLING_ADDRESS, { onCompleted: refetch });
  const [deleteBillingAddress] = useMutation(DELETE_BILLING_ADDRESS, { onCompleted: refetch });
  const [setDefaultBilling] = useMutation(SET_DEFAULT_BILLING_ADDRESS, { onCompleted: refetch });

  // Payment Method Mutations
  const [addPaymentMethod] = useMutation(ADD_PAYMENT_METHOD, { onCompleted: refetch });
  const [updatePaymentMethod] = useMutation(UPDATE_PAYMENT_METHOD, { onCompleted: refetch });
  const [deletePaymentMethod] = useMutation(DELETE_PAYMENT_METHOD, { onCompleted: refetch });
  const [setDefaultPaymentMethod] = useMutation(SET_DEFAULT_PAYMENT_METHOD, { onCompleted: refetch });

  const currentUser = data?.getUsers?.find(u => u._id === authUser?._id);

  // Edit state for profile
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  // Address edit state
  const [editingType, setEditingType] = useState(null); // 'shipping' or 'billing'
  const [addressEditIdx, setAddressEditIdx] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    recipient: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    isDefault: false
  });

  // Payment method edit state
  const [editingPaymentIdx, setEditingPaymentIdx] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    cardType: "",
    cardNumber: "",
    cardholderName: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    isDefault: false,
    //billingAddress: { ... }
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || ""
      });
    }
  }, [currentUser]);

  if (!authUser) return <div style={{ padding: 32 }}>Please log in to view your profile.</div>;
  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', padding: 32 }}>Error: {error.message}</div>;
  if (!currentUser) return <div style={{ padding: 32 }}>User not found.</div>;

  // --------- Profile Edit Handlers ----------
  const handleEdit = () => { setEditMode(true); setMessage(""); };
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: currentUser.name || "",
      email: currentUser.email || "",
      phone: currentUser.phone || "",
      address: currentUser.address || ""
    });
    setMessage('');
  };
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

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

  // --------- Address Management Handlers ----------
  const openAddressEdit = (type, idx) => {
    setEditingType(type);
    setAddressEditIdx(idx);
    if (idx === -1) {
      setAddressForm({
        label: "",
        recipient: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        isDefault: false
      });
    } else {
      const arr = type === 'shipping'
        ? currentUser.shippingAddresses
        : currentUser.billingAddresses;
      setAddressForm({ ...arr[idx] });
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
    if (editingType === 'shipping') {
      if (addressEditIdx === -1) {
        await addShippingAddress({ variables: { userId: currentUser._id, address: addressForm } });
      } else {
        const addrId = currentUser.shippingAddresses[addressEditIdx]._id;
        const {__typename, _id, ...addressPayload } = addressForm;
        //alert(JSON.stringify(addressPayload, null, 2));
        await updateShippingAddress({ variables: { userId: currentUser._id, addressId: addrId, address: addressPayload } });
      }
    } else if (editingType === 'billing') {
      if (addressEditIdx === -1) {
        await addBillingAddress({ variables: { userId: currentUser._id, address: addressForm } });
      } else {
        const {__typename, _id, ...addressPayload } = addressForm;      
        const addrId = currentUser.billingAddresses[addressEditIdx]._id;
        await updateBillingAddress({ variables: { userId: currentUser._id, addressId: addrId, address: addressPayload } });
      }
    }
    setAddressEditIdx(null);
    setEditingType(null);
    setAddressForm({
      label: "",
      recipient: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      isDefault: false
    });
  };

  const handleDeleteAddress = async (type, addressId) => {
    if (window.confirm("Delete this address?")) {
      if (type === 'shipping') {
        await deleteShippingAddress({ variables: { userId: currentUser._id, addressId } });
      } else {
        await deleteBillingAddress({ variables: { userId: currentUser._id, addressId } });
      }
    }
  };

  const handleSetDefaultShipping = async (addressId) => {
    await setDefaultShipping({ variables: { userId: currentUser._id, addressId } });
  };

  const handleSetDefaultBilling = async (addressId) => {
    await setDefaultBilling({ variables: { userId: currentUser._id, addressId } });
  };

  // --------- Payment Method Management Handlers ----------
  const openPaymentEdit = (idx) => {
    setEditingPaymentIdx(idx);
    if (idx === -1) {
      setPaymentForm({
        cardType: "",
        cardNumber: "",
        cardholderName: "",
        expMonth: "",
        expYear: "",
        cvv: "",
        isDefault: false
      });
    } else {
      setPaymentForm({ ...currentUser.paymentMethods[idx] });
    }
  };

  const handlePaymentFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSavePaymentMethod = async e => {
    e.preventDefault();
    if (editingPaymentIdx === -1) {
      const paymentInput = {
        ...paymentForm,
        expMonth: Number(paymentForm.expMonth),
        expYear: Number(paymentForm.expYear),
        billingAddress: paymentForm.billingAddress || null
      };       
      await addPaymentMethod({ variables: { userId: currentUser._id, paymentMethod: paymentInput } });
    } else {
      const paymentInput = {
        ...paymentForm,
        expMonth: Number(paymentForm.expMonth),
        expYear: Number(paymentForm.expYear),
        billingAddress: paymentForm.billingAddress || null,
      };
      const {__typename, _id, ...addressPayload } = paymentInput;
      
      const pmId = currentUser.paymentMethods[editingPaymentIdx]._id;
      //alert(JSON.stringify(addressPayload, null, 2)); 
      await updatePaymentMethod({ variables: { userId: currentUser._id, paymentMethodId: pmId, paymentMethod: addressPayload } });
    }
    setEditingPaymentIdx(null);
    setPaymentForm({
      cardType: "",
      cardNumber: "",
      cardholderName: "",
      expMonth: "",
      expYear: "",
      cvv: "",
      isDefault: false
    });
  };

  const handleDeletePaymentMethod = async (pmId) => {
    if (window.confirm("Delete this payment method?")) {
      await deletePaymentMethod({ variables: { userId: currentUser._id, paymentMethodId: pmId } });
    }
  };

  const handleSetDefaultPaymentMethod = async (pmId) => {
    //alert(JSON.stringify(addressPayload, null, 2));
    await setDefaultPaymentMethod({ variables: { userId: currentUser._id, paymentMethodId: pmId } });
  };

  // ---------------------------------------

  return (
    <div style={{
      padding: '2rem',
      maxWidth: 750,
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
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Profile Address:</td>
                <td style={{ padding: "8px 0" }}>
                  <input type="text" name="address" value={form.address} onChange={handleChange} required />
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Role:</td>
                <td style={{ padding: "8px 0" }}>{currentUser.role}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 20 }}>
            <button type="submit" style={{
              background: "#1976d2", color: "#fff", border: "none", borderRadius: 4,
              padding: "8px 20px", marginRight: 12, cursor: "pointer", fontWeight: "bold"
            }}>Save</button>
            <button type="button" onClick={handleCancel} style={{
              background: "#fff", color: "#1976d2", border: "1px solid #1976d2", borderRadius: 4,
              padding: "8px 20px", cursor: "pointer"
            }}>Cancel</button>
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
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Profile Address:</td>
                <td style={{ padding: "8px 0" }}>{currentUser.address || <i>(not set)</i>}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", padding: "8px 0" }}>Role:</td>
                <td style={{ padding: "8px 0" }}>{currentUser.role}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 20 }}>
            <button type="button" onClick={handleEdit} style={{
              background: "#1976d2", color: "#fff", border: "none", borderRadius: 4,
              padding: "8px 20px", cursor: "pointer", fontWeight: "bold"
            }}>Edit Profile</button>
          </div>
        </>
      )}

      {/* ---- SHIPPING ADDRESSES ---- */}
      <h3 style={{ marginTop: 36 }}>Shipping Addresses</h3>
      <ul>
        {currentUser.shippingAddresses?.map((addr, i) => (
          <li key={addr._id} style={{ marginBottom: 14, border: "1px solid #eee", borderRadius: 6, padding: 8 }}>
            <div>
              <b>{addr.label || "Address"}:</b>
              {addr.recipient && (
                  <span style={{ fontWeight: "normal" }}><i> {addr.recipient},</i></span>
                )}              
              {addr.address}, {addr.city}, {addr.country}
              {addr.isDefault && <span style={{ color: "green" }}> (Default Shipping)</span>}
            </div>
            <div>
              <button onClick={() => openAddressEdit('shipping', i)} style={{ marginRight: 6 }}>Edit</button>
              <button onClick={() => handleDeleteAddress('shipping', addr._id)} style={{ marginRight: 6 }}>Delete</button>
              {!addr.isDefault && <button onClick={() => handleSetDefaultShipping(addr._id)}>Set as Default Shipping</button>}
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => openAddressEdit('shipping', -1)}>Add Shipping Address</button>
      <AddressForm
        type="shipping"
        form={addressForm}
        onChange={handleAddressFormChange}
        onSubmit={handleSaveAddress}
        onCancel={() => { setAddressEditIdx(null); setEditingType(null); }}
        isEditing={editingType === 'shipping' && addressEditIdx !== null}
      />

      {/* ---- BILLING ADDRESSES ---- */}
      <h3 style={{ marginTop: 36 }}>Billing Addresses</h3>
      <ul>
        {currentUser.billingAddresses?.map((addr, i) => (
          <li key={addr._id} style={{ marginBottom: 14, border: "1px solid #eee", borderRadius: 6, padding: 8 }}>
            <div>
              <b>{addr.label || "Address"}:</b> 
              {addr.recipient && (
                  <span style={{ fontWeight: "normal" }}><i> {addr.recipient},</i></span>
                )}              
              {addr.address}, {addr.city}, {addr.country}
              {addr.isDefault && <span style={{ color: "blue" }}> (Default Billing)</span>}
            </div>
            <div>
              <button onClick={() => openAddressEdit('billing', i)} style={{ marginRight: 6 }}>Edit</button>
              <button onClick={() => handleDeleteAddress('billing', addr._id)} style={{ marginRight: 6 }}>Delete</button>
              {!addr.isDefault && <button onClick={() => handleSetDefaultBilling(addr._id)}>Set as Default Billing</button>}
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => openAddressEdit('billing', -1)}>Add Billing Address</button>
      <AddressForm
        type="billing"
        form={addressForm}
        onChange={handleAddressFormChange}
        onSubmit={handleSaveAddress}
        onCancel={() => { setAddressEditIdx(null); setEditingType(null); }}
        isEditing={editingType === 'billing' && addressEditIdx !== null}
      />

      {/* ---- PAYMENT METHODS ---- */}
      <h3 style={{ marginTop: 36 }}>Payment Methods</h3>
      <ul>
        {currentUser.paymentMethods?.map((pm, i) => (
          <li key={pm._id} style={{ marginBottom: 14, border: "1px solid #eee", borderRadius: 6, padding: 8 }}>
            <div>
              <b>{pm.cardType}:</b> **** **** **** {pm.cardNumber.slice(-4)}, {pm.cardholderName}, exp {pm.expMonth}/{pm.expYear}
              {pm.isDefault && <span style={{ color: "green" }}> (Default)</span>}
            </div>
            <div>
              <button onClick={() => openPaymentEdit(i)} style={{ marginRight: 6 }}>Edit</button>
              <button onClick={() => handleDeletePaymentMethod(pm._id)} style={{ marginRight: 6 }}>Delete</button>
              {!pm.isDefault && <button onClick={() => handleSetDefaultPaymentMethod(pm._id)}>Set as Default</button>}
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => openPaymentEdit(-1)}>Add Payment Method</button>

      {/* ---- PAYMENT METHOD EDIT FORM ---- */}
      {editingPaymentIdx !== null && (
        <form onSubmit={handleSavePaymentMethod} style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 6, padding: 14 }}>
          <h4>{editingPaymentIdx === -1 ? "Add Payment Method" : "Edit Payment Method"}</h4>
          <CardTypeSelector value={paymentForm.cardType} onChange={e => setPaymentForm(f => ({ ...f, cardType: e.target.value }))} />
          <input name="cardNumber" placeholder="Card Number" value={paymentForm.cardNumber} onChange={handlePaymentFormChange} required />
          <input name="cardholderName" placeholder="Cardholder Name" value={paymentForm.cardholderName} onChange={handlePaymentFormChange} required />
          <input name="expMonth" type="number" placeholder="Exp Month" value={paymentForm.expMonth} onChange={handlePaymentFormChange} min={1} 
            max={12} required style={{ width: 80, marginRight: 8 }} />
          <input name="expYear" type="number" placeholder="Exp Year" value={paymentForm.expYear} onChange={handlePaymentFormChange} min={2024}
            max={2100} required style={{ width: 100, marginRight: 8 }} />
          <input name="cvv" placeholder="CVV" value={paymentForm.cvv} onChange={handlePaymentFormChange} />         
          <div>
            <label>
              <input
                type="checkbox"
                name="isDefault"
                checked={paymentForm.isDefault}
                onChange={handlePaymentFormChange}
              />
              Default Payment Method
            </label>
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="submit">{editingPaymentIdx === -1 ? "Add" : "Save"}</button>
            <button type="button" onClick={() => setEditingPaymentIdx(null)} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </form>
      )}

      {message && (
        <div style={{ marginTop: 18, color: "#1976d2" }}>
          {message}
        </div>
      )}
    </div>
  );
}
