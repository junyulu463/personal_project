import React, { useState, useEffect, useMemo } from "react";
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
import "../../styles/ShippingPage.css";

export default function ShippingPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");

  const { checkoutData, setCheckoutData } = useCheckout();
  const { authUser } = useAuth();
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    fetchPolicy: "network-only",
    skip: !authUser?._id,
  });

  const [addShippingAddress] = useMutation(ADD_SHIPPING_ADDRESS, { onCompleted: refetch });
  const [updateShippingAddress] = useMutation(UPDATE_SHIPPING_ADDRESS, { onCompleted: refetch });
  const [deleteShippingAddress] = useMutation(DELETE_SHIPPING_ADDRESS, { onCompleted: refetch });
  const [setDefaultShipping] = useMutation(SET_DEFAULT_SHIPPING_ADDRESS, { onCompleted: refetch });

  const currentUser = data?.getUsers?.find(u => u._id === authUser?._id);
  const userAddresses = useMemo(
    () => currentUser?.shippingAddresses || [],
    [currentUser?.shippingAddresses]
  );
  
  const defaultAddressId = currentUser?.defaultShippingAddressId;

  const [selectedAddressId, setSelectedAddressId] = useState(() =>
    checkoutData.shippingAddress?._id ||
    currentUser?.defaultShippingAddressId ||
    (userAddresses[0]?._id ?? "")
  );

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

  useEffect(() => {
    if (currentUser && userAddresses.length === 0) setEditingIdx(-1);
  }, [currentUser, userAddresses.length]);

  useEffect(() => {
    if (userAddresses.length === 1) {
      setSelectedAddressId(userAddresses[0]._id);
    } else if (!selectedAddressId && userAddresses.length > 0) {
      setSelectedAddressId(
        checkoutData.shippingAddress?._id ||
        currentUser?.defaultShippingAddressId ||
        userAddresses[0]._id
      );
    }
    if (userAddresses.length === 0) setSelectedAddressId("");
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

  if (!authUser) return <div className="shippingpage-message">Please log in.</div>;
  if (loading) return <div className="shippingpage-message">Loading...</div>;
  if (error) return <div className="shippingpage-message error">Error: {error.message}</div>;
  if (!currentUser) return <div className="shippingpage-message">User not found.</div>;

  // --- HANDLERS ---
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

  const handleAddressFormChange = e => {
    const { name, value, type, checked } = e.target;
    setAddressForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveAddress = async e => {
    e.preventDefault();
    if (editingIdx === -1) {
      await addShippingAddress({ variables: { userId: currentUser._id, address: addressForm } });
    } else {
      const addrId = userAddresses[editingIdx]._id;
      const { __typename, _id, ...payload } = addressForm;
      await updateShippingAddress({ variables: { userId: currentUser._id, addressId: addrId, address: payload } });
    }
    setEditingIdx(null);
  };

  const handleDeleteAddress = async addrId => {
    if (window.confirm("Delete this address?")) {
      await deleteShippingAddress({ variables: { userId: currentUser._id, addressId: addrId } });
    }
  };

  const handleSetDefault = async addrId => {
    await setDefaultShipping({ variables: { userId: currentUser._id, addressId: addrId } });
  };

  const handleCancel = () => setEditingIdx(null);

  return (
    <div className="shippingpage-root">
      <h2 className="shippingpage-title">Shipping Address</h2>
      <ul className="shippingpage-addrlist">
        {userAddresses.map((addr, i) => (
          <li
            key={addr._id}
            className={`shippingpage-addritem${addr._id === defaultAddressId ? " default" : ""}`}
          >
            <div>
              <b>{addr.label || "Address"}:</b>{" "}
              {addr.recipient && <span>{addr.recipient}, </span>}
              {addr.address}, {addr.city}, {addr.postalCode}, {addr.country}
              {addr.isDefault && <span className="shippingpage-defaultmark"> (Default)</span>}
            </div>
            <div className="shippingpage-addractions">
              <button onClick={() => handleOpenEdit(i)}>Edit</button>
              <button onClick={() => handleDeleteAddress(addr._id)}>Delete</button>
              {!addr.isDefault && (
                <button onClick={() => handleSetDefault(addr._id)}>Set as Default</button>
              )}
              <button
                type="button"
                onClick={() => setSelectedAddressId(addr._id)}
                className={selectedAddressId === addr._id ? "selected" : ""}
              >
                {selectedAddressId === addr._id ? "Selected" : "Use this address"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        className="shippingpage-addbtn"
        onClick={() => handleOpenEdit(-1)}
      >
        Add New Address
      </button>

      {/* Address Form */}
      <AddressForm
        type="shipping"
        form={addressForm}
        onChange={handleAddressFormChange}
        onSubmit={handleSaveAddress}
        onCancel={handleCancel}
        isEditing={editingIdx !== null}
      />

      <div className="shippingpage-nextwrap">
        <button
          type="button"
          className="shippingpage-nextbtn"
          disabled={!selectedAddressId}
          onClick={() => {
            const selectedAddress = userAddresses.find(a => a._id === selectedAddressId);
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

      <div className="shippingpage-backwrap">
        <button type="button" className="shippingpage-backbtn" onClick={() => navigate("/cart")}>
          Back
        </button>
      </div>
    </div>
  );
}
