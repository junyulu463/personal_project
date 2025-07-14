// src/pages/profile/UserProfilePage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, UPDATE_USER } from '../../graphql/userQueries';
import AddressForm from '../components/AddressForm';
import CardTypeSelector from '../components/CardTypeSelector';
import '../../styles/UserProfilePage.css';

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

  if (!authUser) return <div className="userprofile-msg">Please log in to view your profile.</div>;
  if (loading) return <div className="userprofile-msg">Loading...</div>;
  if (error) return <div className="userprofile-msg userprofile-error">Error: {error.message}</div>;
  if (!currentUser) return <div className="userprofile-msg">User not found.</div>;

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
    await setDefaultPaymentMethod({ variables: { userId: currentUser._id, paymentMethodId: pmId } });
  };

  // ---------------------------------------

  return (
    <div className="userprofile-container">
      <button
        onClick={() => navigate(-1)}
        className="userprofile-back-btn"
      >
        ← Back
      </button>

      <h2>👤 User Profile</h2>
      {editMode ? (
        <form onSubmit={handleSave}>
          <table className="userprofile-table">
            <tbody>
              <tr>
                <td className="userprofile-label">Username:</td>
                <td>{currentUser.username}</td>
              </tr>
              <tr>
                <td className="userprofile-label">Email:</td>
                <td>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </td>
              </tr>
              <tr>
                <td className="userprofile-label">Name:</td>
                <td>
                  <input type="text" name="name" value={form.name} onChange={handleChange} />
                </td>
              </tr>
              <tr>
                <td className="userprofile-label">Phone:</td>
                <td>
                  <input type="text" name="phone" value={form.phone} onChange={handleChange} />
                </td>
              </tr>
              <tr>
                <td className="userprofile-label">Profile Address:</td>
                <td>
                  <input type="text" name="address" value={form.address} onChange={handleChange} required />
                </td>
              </tr>
              <tr>
                <td className="userprofile-label">Role:</td>
                <td>{currentUser.role}</td>
              </tr>
            </tbody>
          </table>
          <div className="userprofile-btn-row">
            <button type="submit" className="userprofile-save-btn">Save</button>
            <button type="button" onClick={handleCancel} className="userprofile-cancel-btn">Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <table className="userprofile-table">
            <tbody>
              <tr>
                <td className="userprofile-label">Username:</td>
                <td>{currentUser.username}</td>
              </tr>
              <tr>
                <td className="userprofile-label">Email:</td>
                <td>{currentUser.email}</td>
              </tr>
              <tr>
                <td className="userprofile-label">Name:</td>
                <td>{currentUser.name || <i>(not set)</i>}</td>
              </tr>
              <tr>
                <td className="userprofile-label">Phone:</td>
                <td>{currentUser.phone || <i>(not set)</i>}</td>
              </tr>
              <tr>
                <td className="userprofile-label">Profile Address:</td>
                <td>{currentUser.address || <i>(not set)</i>}</td>
              </tr>
              <tr>
                <td className="userprofile-label">Role:</td>
                <td>{currentUser.role}</td>
              </tr>
            </tbody>
          </table>
          <div className="userprofile-btn-row">
            <button type="button" onClick={handleEdit} className="userprofile-edit-btn">Edit Profile</button>
          </div>
        </>
      )}

      {/* ---- SHIPPING ADDRESSES ---- */}
      <h3 className="userprofile-section-header">Shipping Addresses</h3>
      <ul className="userprofile-list">
        {currentUser.shippingAddresses?.map((addr, i) => (
          <li key={addr._id} className="userprofile-list-item">
            <div>
              <b>{addr.label || "Address"}:</b>
              {addr.recipient && (
                <span className="userprofile-recipient"><i> {addr.recipient},</i></span>
              )}              
              {addr.address}, {addr.city}, {addr.country}
              {addr.isDefault && <span className="userprofile-default-shipping"> (Default Shipping)</span>}
            </div>
            <div>
              <button onClick={() => openAddressEdit('shipping', i)} className="userprofile-inline-btn">Edit</button>
              <button onClick={() => handleDeleteAddress('shipping', addr._id)} className="userprofile-inline-btn">Delete</button>
              {!addr.isDefault && <button onClick={() => handleSetDefaultShipping(addr._id)} className="userprofile-inline-btn">Set as Default Shipping</button>}
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => openAddressEdit('shipping', -1)} className="userprofile-add-btn">Add Shipping Address</button>
      <AddressForm
        type="shipping"
        form={addressForm}
        onChange={handleAddressFormChange}
        onSubmit={handleSaveAddress}
        onCancel={() => { setAddressEditIdx(null); setEditingType(null); }}
        isEditing={editingType === 'shipping' && addressEditIdx !== null}
      />

      {/* ---- BILLING ADDRESSES ---- */}
      <h3 className="userprofile-section-header">Billing Addresses</h3>
      <ul className="userprofile-list">
        {currentUser.billingAddresses?.map((addr, i) => (
          <li key={addr._id} className="userprofile-list-item">
            <div>
              <b>{addr.label || "Address"}:</b> 
              {addr.recipient && (
                <span className="userprofile-recipient"><i> {addr.recipient},</i></span>
              )}              
              {addr.address}, {addr.city}, {addr.country}
              {addr.isDefault && <span className="userprofile-default-billing"> (Default Billing)</span>}
            </div>
            <div>
              <button onClick={() => openAddressEdit('billing', i)} className="userprofile-inline-btn">Edit</button>
              <button onClick={() => handleDeleteAddress('billing', addr._id)} className="userprofile-inline-btn">Delete</button>
              {!addr.isDefault && <button onClick={() => handleSetDefaultBilling(addr._id)} className="userprofile-inline-btn">Set as Default Billing</button>}
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => openAddressEdit('billing', -1)} className="userprofile-add-btn">Add Billing Address</button>
      <AddressForm
        type="billing"
        form={addressForm}
        onChange={handleAddressFormChange}
        onSubmit={handleSaveAddress}
        onCancel={() => { setAddressEditIdx(null); setEditingType(null); }}
        isEditing={editingType === 'billing' && addressEditIdx !== null}
      />

      {/* ---- PAYMENT METHODS ---- */}
      <h3 className="userprofile-section-header">Payment Methods</h3>
      <ul className="userprofile-list">
        {currentUser.paymentMethods?.map((pm, i) => (
          <li key={pm._id} className="userprofile-list-item">
            <div>
              <b>{pm.cardType}:</b> **** **** **** {pm.cardNumber.slice(-4)}, {pm.cardholderName}, exp {pm.expMonth}/{pm.expYear}
              {pm.isDefault && <span className="userprofile-default-payment"> (Default)</span>}
            </div>
            <div>
              <button onClick={() => openPaymentEdit(i)} className="userprofile-inline-btn">Edit</button>
              <button onClick={() => handleDeletePaymentMethod(pm._id)} className="userprofile-inline-btn">Delete</button>
              {!pm.isDefault && <button onClick={() => handleSetDefaultPaymentMethod(pm._id)} className="userprofile-inline-btn">Set as Default</button>}
            </div>
          </li>
        ))}
      </ul>
      <button onClick={() => openPaymentEdit(-1)} className="userprofile-add-btn">Add Payment Method</button>

      {/* ---- PAYMENT METHOD EDIT FORM ---- */}
      {editingPaymentIdx !== null && (
        <form onSubmit={handleSavePaymentMethod} className="userprofile-payment-form">
          <h4>{editingPaymentIdx === -1 ? "Add Payment Method" : "Edit Payment Method"}</h4>
          <CardTypeSelector value={paymentForm.cardType} onChange={e => setPaymentForm(f => ({ ...f, cardType: e.target.value }))} />
          <input name="cardNumber" placeholder="Card Number" value={paymentForm.cardNumber} onChange={handlePaymentFormChange} required />
          <input name="cardholderName" placeholder="Cardholder Name" value={paymentForm.cardholderName} onChange={handlePaymentFormChange} required />
          <input name="expMonth" type="number" placeholder="Exp Month" value={paymentForm.expMonth} onChange={handlePaymentFormChange} min={1} max={12} required className="userprofile-exp-month" />
          <input name="expYear" type="number" placeholder="Exp Year" value={paymentForm.expYear} onChange={handlePaymentFormChange} min={2024} max={2100} required className="userprofile-exp-year" />
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
          <div className="userprofile-btn-row">
            <button type="submit">{editingPaymentIdx === -1 ? "Add" : "Save"}</button>
            <button type="button" onClick={() => setEditingPaymentIdx(null)} className="userprofile-cancel-btn">Cancel</button>
          </div>
        </form>
      )}

      {message && (
        <div className="userprofile-message">
          {message}
        </div>
      )}
    </div>
  );
}
