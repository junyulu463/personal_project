// src/pages/checkoutpages/ShippingPage.js

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCheckout } from "../../context/CheckoutContext";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_USERS,
  ADD_SHIPPING_ADDRESS,
  UPDATE_SHIPPING_ADDRESS,
  DELETE_SHIPPING_ADDRESS,
  SET_DEFAULT_SHIPPING_ADDRESS,
} from "../../graphql/userQueries";
import AddressForm from "../components/AddressForm";

export default function ShippingPage() {

  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");

  const { checkoutData, setCheckoutData } = useCheckout();
  const { authUser } = useAuth();
  const navigate = useNavigate();

  // Apollo Query to get all users (like profile page)
  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    fetchPolicy: "network-only",
    skip: !authUser?._id,
  });

  // Mutations (all with refetch)
  const [addShippingAddress] = useMutation(ADD_SHIPPING_ADDRESS, { onCompleted: refetch });
  const [updateShippingAddress] = useMutation(UPDATE_SHIPPING_ADDRESS, { onCompleted: refetch });
  const [deleteShippingAddress] = useMutation(DELETE_SHIPPING_ADDRESS, { onCompleted: refetch });
  const [setDefaultShipping] = useMutation(SET_DEFAULT_SHIPPING_ADDRESS, { onCompleted: refetch });

  // Current user object from query
  const currentUser = data?.getUsers?.find(u => u._id === authUser?._id);
  const userAddresses = currentUser?.shippingAddresses || [];
  const defaultAddressId = currentUser?.defaultShippingAddressId;

  const [selectedAddressId, setSelectedAddressId] = useState(() =>
    checkoutData.shippingAddress?._id ||
    currentUser?.defaultShippingAddressId ||
    (userAddresses[0]?._id ?? "")
  );
  
  
  // Edit/Add form state
  const [editingIdx, setEditingIdx] = useState(null); // null = not editing, -1 = add new
  const [addressForm, setAddressForm] = useState({
    label: "",
    recipient: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    isDefault: false,
  });

  // Show add form if there are no addresses (auto-popup on mount)
  useEffect(() => {
    if (currentUser && userAddresses.length === 0) setEditingIdx(-1);
  }, [currentUser, userAddresses.length]);
  useEffect(() => {
    // If only one address, always select it
    if (userAddresses.length === 1) {
      setSelectedAddressId(userAddresses[0]._id);
    }
    // If nothing is selected but addresses exist, select default or first
    else if (!selectedAddressId && userAddresses.length > 0) {
      setSelectedAddressId(
        checkoutData.shippingAddress?._id ||
        currentUser?.defaultShippingAddressId ||
        userAddresses[0]._id
      );
    }
    // If no addresses, clear selection
    if (userAddresses.length === 0) setSelectedAddressId("");
    // If the selected address was deleted, select default or first
    if (
      selectedAddressId &&
      !userAddresses.some(a => a._id === selectedAddressId) &&
      userAddresses.length > 0
    ) {
      setSelectedAddressId(
        currentUser?.defaultShippingAddressId || userAddresses[0]._id
      );
    }
  }, [
    userAddresses,
    selectedAddressId,
    checkoutData.shippingAddress,
    currentUser?.defaultShippingAddressId,
  ]);
  
  

  // If not logged in, loading, error, etc.
  if (!authUser) return <div style={{ padding: 32 }}>Please log in.</div>;
  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ color: "red", padding: 32 }}>Error: {error.message}</div>;
  if (!currentUser) return <div style={{ padding: 32 }}>User not found.</div>;

  // --- HANDLERS ---
  // Open the edit form (add or edit)
  const handleOpenEdit = idx => {
    setEditingIdx(idx);
    if (idx === -1) {
      setAddressForm({
        label: "",
        recipient: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        isDefault: userAddresses.length === 0,
      });
    } else {
      setAddressForm({ ...userAddresses[idx] });
    }
  };

  // Handle input change
  const handleAddressFormChange = e => {
    const { name, value, type, checked } = e.target;
    setAddressForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save (add or update)
  const handleSaveAddress = async e => {
    e.preventDefault();
    if (editingIdx === -1) {
      await addShippingAddress({ variables: { userId: currentUser._id, address: addressForm } });
    } else {
      const addrId = userAddresses[editingIdx]._id;
      // Exclude _id/__typename if present
      const { __typename, _id, ...payload } = addressForm;
      await updateShippingAddress({ variables: { userId: currentUser._id, addressId: addrId, address: payload } });
    }
    setEditingIdx(null);
  };

  // Delete
  const handleDeleteAddress = async addrId => {
    if (window.confirm("Delete this address?")) {
      await deleteShippingAddress({ variables: { userId: currentUser._id, addressId: addrId } });
    }
  };

  // Set as default
  const handleSetDefault = async addrId => {
    await setDefaultShipping({ variables: { userId: currentUser._id, addressId: addrId } });
  };

  // Choose this address for checkout and go to next page
  // const handleChooseAddress = address => {
  //   setCheckoutData(d => ({ ...d, shippingAddress: address }));
  //   alert("Shipping Address saved for checkout:\n" + JSON.stringify(address, null, 2));
  //   if (orderId) {
  //     navigate(`/checkout/payment?orderId=${orderId}`);
  //   } else {
  //     navigate("/checkout/payment");
  //   }
  // };

  // Cancel add/edit
  const handleCancel = () => setEditingIdx(null);

  // --- RENDER ---
  return (
    <div
      style={{
        maxWidth: 540,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px #eee",
        padding: 32,
      }}
    >
      <h2>Shipping Address</h2>

      <ul style={{ padding: 0, listStyle: "none" }}>
        {userAddresses.map((addr, i) => (
          <li
            key={addr._id}
            style={{
              marginBottom: 16,
              border: "1px solid #eee",
              borderRadius: 6,
              padding: 12,
              background: addr._id === defaultAddressId ? "#f6fafd" : "#fafbfc",
            }}
          >
            <div>
              <b>{addr.label || "Address"}:</b>{" "}
              {addr.recipient && <span>{addr.recipient}, </span>}
              {addr.address}, {addr.city}, {addr.postalCode}, {addr.country}
              {addr.isDefault && <span style={{ color: "green" }}> (Default)</span>}
            </div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => handleOpenEdit(i)} style={{ marginRight: 6 }}>
                Edit
              </button>
              <button onClick={() => handleDeleteAddress(addr._id)} style={{ marginRight: 6 }}>
                Delete
              </button>
              {!addr.isDefault && (
                <button onClick={() => handleSetDefault(addr._id)} style={{ marginRight: 6 }}>
                  Set as Default
                </button>
              )}
            <button
              type="button"
              onClick={() => setSelectedAddressId(addr._id)}
              style={{
                marginLeft: 6,
                background: selectedAddressId === addr._id ? "#ffd814" : "#fff",
                fontWeight: selectedAddressId === addr._id ? "bold" : "normal",
                border: selectedAddressId === addr._id ? "2px solid #ffd814" : undefined,
                borderRadius: 4,
              }}
            >
              {selectedAddressId === addr._id ? "Selected" : "Use this address"}
            </button>

            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={() => handleOpenEdit(-1)}
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 4,
          padding: "8px 16px",
          marginBottom: 16,
          marginTop: 10,
          cursor: "pointer",
        }}
      >
        Add New Address
      </button>

      {/* Address Form Modal/Section */}
      <AddressForm
        type="shipping"
        form={addressForm}
        onChange={handleAddressFormChange}
        onSubmit={handleSaveAddress}
        onCancel={handleCancel}
        isEditing={editingIdx !== null}
      />

      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          disabled={!selectedAddressId}
          style={{
            background: "#ffd814",
            fontWeight: "bold",
            borderRadius: 4,
            padding: "8px 24px",
            marginRight: 12,
            opacity: selectedAddressId ? 1 : 0.5,
            cursor: selectedAddressId ? "pointer" : "not-allowed"
          }}
          onClick={() => {
            const selectedAddress = userAddresses.find(a => a._id === selectedAddressId);
            // alert("Shipping Address saved for checkout:\n" + JSON.stringify(selectedAddress, null, 2));
            setCheckoutData(d => ({ ...d, shippingAddress: selectedAddress }));
            if (orderId) {
              navigate(`/checkout/payment?orderId=${orderId}`);
            } else {
              navigate("/checkout/payment");
            }
          }}
        >
          Next
        </button>
      </div>


      <div style={{ marginTop: 36 }}>
        <button type="button" onClick={() => navigate("/cart")}>
          Back
        </button>
      </div>
    </div>
  );
}
