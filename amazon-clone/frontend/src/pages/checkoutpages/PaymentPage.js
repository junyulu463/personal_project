import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCheckout } from "../../context/CheckoutContext";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_USERS,
  ADD_PAYMENT_METHOD,
  UPDATE_PAYMENT_METHOD,
  DELETE_PAYMENT_METHOD,
  SET_DEFAULT_PAYMENT_METHOD,
  ADD_BILLING_ADDRESS,
  UPDATE_BILLING_ADDRESS,
  DELETE_BILLING_ADDRESS,
  SET_DEFAULT_BILLING_ADDRESS,
} from "../../graphql/userQueries";
import CardTypeSelector from "../components/CardTypeSelector";
import AddressForm from "../components/AddressForm";

export default function PaymentPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");
  const { checkoutData, setCheckoutData } = useCheckout();
  const { authUser } = useAuth();
  const navigate = useNavigate();

  // Query user
  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    fetchPolicy: "network-only",
    skip: !authUser?._id,
  });

  // Payment Method Mutations
  const [addPaymentMethod] = useMutation(ADD_PAYMENT_METHOD, { onCompleted: refetch });
  const [updatePaymentMethod] = useMutation(UPDATE_PAYMENT_METHOD, { onCompleted: refetch });
  const [deletePaymentMethod] = useMutation(DELETE_PAYMENT_METHOD, { onCompleted: refetch });
  const [setDefaultPaymentMethod] = useMutation(SET_DEFAULT_PAYMENT_METHOD, { onCompleted: refetch });

  // Billing Address Mutations
  const [addBillingAddress] = useMutation(ADD_BILLING_ADDRESS, { onCompleted: refetch });
  const [updateBillingAddress] = useMutation(UPDATE_BILLING_ADDRESS, { onCompleted: refetch });
  const [deleteBillingAddress] = useMutation(DELETE_BILLING_ADDRESS, { onCompleted: refetch });
  const [setDefaultBilling] = useMutation(SET_DEFAULT_BILLING_ADDRESS, { onCompleted: refetch });

  // Get user data
  const currentUser = data?.getUsers?.find(u => u._id === authUser?._id);
  const paymentMethods = useMemo(
    () => currentUser?.paymentMethods || [],
    [currentUser?.paymentMethods]
  );
  const defaultPaymentId = currentUser?.defaultPaymentMethodId;
  const billingAddresses = useMemo(
    () => currentUser?.billingAddresses || [],
    [currentUser?.billingAddresses]
  );
  const defaultBillingId = currentUser?.defaultBillingAddressId;

  // UI State
  const [selectedPaymentId, setSelectedPaymentId] = useState(() =>
    checkoutData.paymentMethod?._id || defaultPaymentId || (paymentMethods[0]?._id ?? "")
  );
  useEffect(() => {
    // If only one payment method, always select it
    if (paymentMethods.length === 1) {
      setSelectedPaymentId(paymentMethods[0]._id);
    }
    // If nothing is selected but methods exist, select default or first
    else if (!selectedPaymentId && paymentMethods.length > 0) {
      setSelectedPaymentId(
        checkoutData.paymentMethod?._id ||
        defaultPaymentId ||
        paymentMethods[0]._id
      );
    }
    // If no methods, clear selection
    if (paymentMethods.length === 0) setSelectedPaymentId("");
    // If selected payment was deleted, select default or first
    if (
      selectedPaymentId &&
      !paymentMethods.some(pm => pm._id === selectedPaymentId) &&
      paymentMethods.length > 0
    ) {
      setSelectedPaymentId(
        defaultPaymentId || paymentMethods[0]._id
      );
    }
  }, [
    paymentMethods,
    selectedPaymentId,
    checkoutData.paymentMethod,
    defaultPaymentId,
  ]);
  

  // Add/Edit Payment Method
  const [editingIdx, setEditingIdx] = useState(null); // null = not editing, -1 = add new
  const [paymentForm, setPaymentForm] = useState({
    cardType: "",
    cardNumber: "",
    cardholderName: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    isDefault: false,
  });

  // Billing Address Management
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [selectedBillingId, setSelectedBillingId] = useState(
    checkoutData.billingAddress?._id || defaultBillingId || (billingAddresses[0]?._id ?? "")
  );
  useEffect(() => {
    if (!selectedBillingId && billingAddresses.length > 0) {
      setSelectedBillingId(
        checkoutData.billingAddress?._id || defaultBillingId || billingAddresses[0]._id
      );
    }
    if (billingAddresses.length === 0) setSelectedBillingId("");
  }, [billingAddresses, selectedBillingId, checkoutData.billingAddress, defaultBillingId]);

  const [billingEditingIdx, setBillingEditingIdx] = useState(null); // null = not editing, -1 = add new
  const [billingForm, setBillingForm] = useState({
    label: "",
    recipient: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    isDefault: false,
  });

  // Use shipping as billing address effect
  useEffect(() => {
    if (useShippingAsBilling && checkoutData.shippingAddress) {
      setSelectedBillingId("");
    }
  }, [useShippingAsBilling, checkoutData.shippingAddress]);

  // --- Payment Method Handlers ---
  const handleOpenEdit = idx => {
    setEditingIdx(idx);
    if (idx === -1) {
      setPaymentForm({
        cardType: "",
        cardNumber: "",
        cardholderName: "",
        expMonth: "",
        expYear: "",
        cvv: "",
        isDefault: false,
      });
    } else {
      setPaymentForm({ ...paymentMethods[idx] });
    }
  };
  const handlePaymentFormChange = e => {
    const { name, value, type, checked } = e.target;
    setPaymentForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSavePayment = async e => {
    e.preventDefault();
    const paymentInput = {
      ...paymentForm,
      expMonth: Number(paymentForm.expMonth),
      expYear: Number(paymentForm.expYear),
    };
    if (editingIdx === -1) {
      await addPaymentMethod({ variables: { userId: currentUser._id, paymentMethod: paymentInput } });
    } else {
      const { __typename, _id, ...payload } = paymentInput;
      const pmId = paymentMethods[editingIdx]._id;
      await updatePaymentMethod({ variables: { userId: currentUser._id, paymentMethodId: pmId, paymentMethod: payload } });
    }
    setEditingIdx(null);
  };
  const handleDeletePayment = async pmId => {
    if (window.confirm("Delete this payment method?")) {
      await deletePaymentMethod({ variables: { userId: currentUser._id, paymentMethodId: pmId } });
    }
  };
  const handleSetDefaultPayment = async pmId => {
    await setDefaultPaymentMethod({ variables: { userId: currentUser._id, paymentMethodId: pmId } });
  };

  // --- Billing Address Handlers (same as shipping/profile) ---
  const handleBillingOpenEdit = idx => {
    setBillingEditingIdx(idx);
    if (idx === -1) {
      setBillingForm({
        label: "",
        recipient: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        isDefault: false,
      });
    } else {
      setBillingForm({ ...billingAddresses[idx] });
    }
  };
  const handleBillingFormChange = e => {
    const { name, value, type, checked } = e.target;
    setBillingForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSaveBilling = async e => {
    e.preventDefault();
    if (billingEditingIdx === -1) {
      await addBillingAddress({ variables: { userId: currentUser._id, address: billingForm } });
    } else {
      const addrId = billingAddresses[billingEditingIdx]._id;
      const { __typename, _id, ...payload } = billingForm;
      await updateBillingAddress({ variables: { userId: currentUser._id, addressId: addrId, address: payload } });
    }
    setBillingEditingIdx(null);
  };
  const handleDeleteBilling = async addrId => {
    if (window.confirm("Delete this address?")) {
      await deleteBillingAddress({ variables: { userId: currentUser._id, addressId: addrId } });
    }
  };
  const handleSetDefaultBilling = async addrId => {
    await setDefaultBilling({ variables: { userId: currentUser._id, addressId: addrId } });
  };

  // --- Next: save to checkout context, go to review page
  const handleNext = e => {
    e.preventDefault();
    const selectedPayment = paymentMethods.find(pm => pm._id === selectedPaymentId);
    let chosenBillingAddress = null;
    if (useShippingAsBilling) {
      chosenBillingAddress = checkoutData.shippingAddress;
    } else {
      chosenBillingAddress = billingAddresses.find(a => a._id === selectedBillingId);
    }
    if (!selectedPayment) {
      alert("Please select a payment method.");
      return;
    }
    if (!chosenBillingAddress || !chosenBillingAddress.address) {
      alert("Please select a billing address.");
      return;
    }
    // alert("paymentMethod for checkout:\n" + JSON.stringify(selectedPayment, null, 2));
    // alert("chosenBillingAddress for checkout:\n" + JSON.stringify(chosenBillingAddress, null, 2));
    setCheckoutData(d => ({
      ...d,
      paymentMethod: selectedPayment,
      billingAddress: { ...chosenBillingAddress }
    }));
    if (orderId) {
      navigate(`/checkout/review?orderId=${orderId}`);
    } else {
      navigate("/checkout/review");
    }
  };

  // --- Render ---
  if (!authUser) return <div style={{ padding: 32 }}>Please log in.</div>;
  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ color: "red", padding: 32 }}>Error: {error.message}</div>;
  if (!currentUser) return <div style={{ padding: 32 }}>User not found.</div>;

  return (
    <div
      style={{
        maxWidth: 650,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px #eee",
        padding: 32,
      }}
    >
      <h2>Payment Method</h2>
      <ul style={{ padding: 0, listStyle: "none" }}>
        {paymentMethods.map((pm, i) => (
          <li
            key={pm._id}
            style={{
              marginBottom: 16,
              border: "1px solid #eee",
              borderRadius: 6,
              padding: 12,
              background: pm._id === defaultPaymentId ? "#f6fafd" : "#fafbfc",
            }}
          >
            <div>
              <b>{pm.cardType}:</b> **** **** **** {pm.cardNumber.slice(-4)}, {pm.cardholderName}, exp {pm.expMonth}/{pm.expYear}
              {pm.isDefault && <span style={{ color: "green" }}> (Default)</span>}
            </div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => handleOpenEdit(i)} style={{ marginRight: 6 }}>
                Edit
              </button>
              <button onClick={() => handleDeletePayment(pm._id)} style={{ marginRight: 6 }}>
                Delete
              </button>
              {!pm.isDefault && (
                <button onClick={() => handleSetDefaultPayment(pm._id)} style={{ marginRight: 6 }}>
                  Set as Default
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedPaymentId(pm._id)}
                style={{
                  marginLeft: 6,
                  background: selectedPaymentId === pm._id ? "#ffd814" : "#fff",
                  fontWeight: selectedPaymentId === pm._id ? "bold" : "normal",
                  border: selectedPaymentId === pm._id ? "2px solid #ffd814" : undefined,
                  borderRadius: 4,
                }}
              >
                {selectedPaymentId === pm._id ? "Selected" : "Use this card"}
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
        Add New Card
      </button>
      {/* Add/Edit Payment Method Form */}
      {editingIdx !== null && (
        <form onSubmit={handleSavePayment} style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 6, padding: 14 }}>
          <h4>{editingIdx === -1 ? "Add Payment Method" : "Edit Payment Method"}</h4>
          <CardTypeSelector value={paymentForm.cardType} onChange={e => setPaymentForm(f => ({ ...f, cardType: e.target.value }))} />
          <input name="cardNumber" placeholder="Card Number" value={paymentForm.cardNumber} onChange={handlePaymentFormChange} required />
          <input name="cardholderName" placeholder="Cardholder Name" value={paymentForm.cardholderName} onChange={handlePaymentFormChange} required />
          <input name="expMonth" type="number" placeholder="Exp Month" value={paymentForm.expMonth} onChange={handlePaymentFormChange} min={1} max={12} required style={{ width: 80, marginRight: 8 }} />
          <input name="expYear" type="number" placeholder="Exp Year" value={paymentForm.expYear} onChange={handlePaymentFormChange} min={2024} max={2100} required style={{ width: 100, marginRight: 8 }} />
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
            <button type="submit">{editingIdx === -1 ? "Add" : "Save"}</button>
            <button type="button" onClick={() => setEditingIdx(null)} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Billing Address Section */}
      <div style={{ marginTop: 32 }}>
        <label>
          <input
            type="checkbox"
            checked={useShippingAsBilling}
            onChange={e => setUseShippingAsBilling(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          Use shipping address as billing address
        </label>
      </div>

      {!useShippingAsBilling && (
        <>
          {/* Billing Address Selection and Management */}
          <ul style={{ padding: 0, listStyle: "none" }}>
            {billingAddresses.map((addr, i) => (
              <li
                key={addr._id}
                style={{
                  marginBottom: 14,
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 8,
                  background: addr._id === defaultBillingId ? "#f6fafd" : "#fafbfc",
                }}
              >
                <div>
                  <b>{addr.label || "Address"}:</b>{" "}
                  {addr.recipient && <span>{addr.recipient}, </span>}
                  {addr.address}, {addr.city}, {addr.postalCode}, {addr.country}
                  {addr.isDefault && <span style={{ color: "blue" }}> (Default Billing)</span>}
                </div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => handleBillingOpenEdit(i)} style={{ marginRight: 6 }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteBilling(addr._id)} style={{ marginRight: 6 }}>
                    Delete
                  </button>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefaultBilling(addr._id)} style={{ marginRight: 6 }}>
                      Set as Default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedBillingId(addr._id)}
                    style={{
                      marginLeft: 6,
                      background: selectedBillingId === addr._id ? "#ffd814" : "#fff",
                      fontWeight: selectedBillingId === addr._id ? "bold" : "normal",
                      border: selectedBillingId === addr._id ? "2px solid #ffd814" : undefined,
                      borderRadius: 4,
                    }}
                  >
                    {selectedBillingId === addr._id ? "Selected" : "Use this address"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleBillingOpenEdit(-1)}
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
            Add New Billing Address
          </button>
          <AddressForm
            type="billing"
            form={billingForm}
            onChange={handleBillingFormChange}
            onSubmit={handleSaveBilling}
            onCancel={() => setBillingEditingIdx(null)}
            isEditing={billingEditingIdx !== null}
          />
        </>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <button
          type="button"
          onClick={() =>
            orderId
              ? navigate(`/checkout/shipping?orderId=${orderId}`)
              : navigate("/checkout/shipping")
          }
        >
          Back
        </button>
        <button
          type="button"
          disabled={!selectedPaymentId || (!useShippingAsBilling && !selectedBillingId)}
          style={{
            background: "#ffd814",
            fontWeight: "bold",
            borderRadius: 4,
            padding: "8px 24px",
            marginRight: 12,
            opacity: selectedPaymentId && (useShippingAsBilling || selectedBillingId) ? 1 : 0.5,
            cursor: selectedPaymentId && (useShippingAsBilling || selectedBillingId) ? "pointer" : "not-allowed"
          }}
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
