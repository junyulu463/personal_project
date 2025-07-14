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
import "../../styles/PaymentPage.css";

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

  // Payment/Billing Mutations
  const [addPaymentMethod] = useMutation(ADD_PAYMENT_METHOD, { onCompleted: refetch });
  const [updatePaymentMethod] = useMutation(UPDATE_PAYMENT_METHOD, { onCompleted: refetch });
  const [deletePaymentMethod] = useMutation(DELETE_PAYMENT_METHOD, { onCompleted: refetch });
  const [setDefaultPaymentMethod] = useMutation(SET_DEFAULT_PAYMENT_METHOD, { onCompleted: refetch });
  const [addBillingAddress] = useMutation(ADD_BILLING_ADDRESS, { onCompleted: refetch });
  const [updateBillingAddress] = useMutation(UPDATE_BILLING_ADDRESS, { onCompleted: refetch });
  const [deleteBillingAddress] = useMutation(DELETE_BILLING_ADDRESS, { onCompleted: refetch });
  const [setDefaultBilling] = useMutation(SET_DEFAULT_BILLING_ADDRESS, { onCompleted: refetch });

  // Get user data
  const currentUser = data?.getUsers?.find(u => u._id === authUser?._id);
  const paymentMethods = useMemo(() => currentUser?.paymentMethods || [], [currentUser?.paymentMethods]);
  const defaultPaymentId = currentUser?.defaultPaymentMethodId;
  const billingAddresses = useMemo(() => currentUser?.billingAddresses || [], [currentUser?.billingAddresses]);
  const defaultBillingId = currentUser?.defaultBillingAddressId;

  // UI State
  const [selectedPaymentId, setSelectedPaymentId] = useState(() =>
    checkoutData.paymentMethod?._id || defaultPaymentId || (paymentMethods[0]?._id ?? "")
  );
  useEffect(() => {
    if (paymentMethods.length === 1) {
      setSelectedPaymentId(paymentMethods[0]._id);
    } else if (!selectedPaymentId && paymentMethods.length > 0) {
      setSelectedPaymentId(
        checkoutData.paymentMethod?._id || defaultPaymentId || paymentMethods[0]._id
      );
    }
    if (paymentMethods.length === 0) setSelectedPaymentId("");
    if (
      selectedPaymentId &&
      !paymentMethods.some(pm => pm._id === selectedPaymentId) &&
      paymentMethods.length > 0
    ) {
      setSelectedPaymentId(defaultPaymentId || paymentMethods[0]._id);
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

  // Billing Address
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

  // --- Billing Address Handlers ---
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
  if (!authUser) return <div className="paymentpage-message">Please log in.</div>;
  if (loading) return <div className="paymentpage-message">Loading...</div>;
  if (error) return <div className="paymentpage-message" style={{ color: "red" }}>Error: {error.message}</div>;
  if (!currentUser) return <div className="paymentpage-message">User not found.</div>;

  return (
    <div className="paymentpage-root">
      <h2>Payment Method</h2>
      <ul className="paymentpage-cardlist">
        {paymentMethods.map((pm, i) => (
          <li
            key={pm._id}
            className={`paymentpage-card ${pm._id === defaultPaymentId ? "default" : ""}`}
          >
            <div>
              <b>{pm.cardType}:</b> **** **** **** {pm.cardNumber.slice(-4)}, {pm.cardholderName}, exp {pm.expMonth}/{pm.expYear}
              {pm.isDefault && <span className="paymentpage-card-default"> (Default)</span>}
            </div>
            <div className="paymentpage-card-actions">
              <button onClick={() => handleOpenEdit(i)}>Edit</button>
              <button onClick={() => handleDeletePayment(pm._id)}>Delete</button>
              {!pm.isDefault && (
                <button onClick={() => handleSetDefaultPayment(pm._id)}>Set as Default</button>
              )}
              <button
                type="button"
                className={`paymentpage-selectbtn${selectedPaymentId === pm._id ? " selected" : ""}`}
                onClick={() => setSelectedPaymentId(pm._id)}
              >
                {selectedPaymentId === pm._id ? "Selected" : "Use this card"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button className="paymentpage-addbtn" onClick={() => handleOpenEdit(-1)}>
        Add New Card
      </button>
      {editingIdx !== null && (
        <form className="paymentpage-editform" onSubmit={handleSavePayment}>
          <h4>{editingIdx === -1 ? "Add Payment Method" : "Edit Payment Method"}</h4>
          <CardTypeSelector value={paymentForm.cardType} onChange={e => setPaymentForm(f => ({ ...f, cardType: e.target.value }))} />
          <input name="cardNumber" placeholder="Card Number" value={paymentForm.cardNumber} onChange={handlePaymentFormChange} required />
          <input name="cardholderName" placeholder="Cardholder Name" value={paymentForm.cardholderName} onChange={handlePaymentFormChange} required />
          <input name="expMonth" type="number" placeholder="Exp Month" value={paymentForm.expMonth} onChange={handlePaymentFormChange} min={1} max={12} required />
          <input name="expYear" type="number" placeholder="Exp Year" value={paymentForm.expYear} onChange={handlePaymentFormChange} min={2024} max={2100} required />
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
          <div className="paymentpage-formbtns">
            <button type="submit">{editingIdx === -1 ? "Add" : "Save"}</button>
            <button type="button" onClick={() => setEditingIdx(null)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Billing Address Section */}
      <div className="paymentpage-billingcheckbox">
        <label>
          <input
            type="checkbox"
            checked={useShippingAsBilling}
            onChange={e => setUseShippingAsBilling(e.target.checked)}
          />
          Use shipping address as billing address
        </label>
      </div>

      {!useShippingAsBilling && (
        <>
          <ul className="paymentpage-billinglist">
            {billingAddresses.map((addr, i) => (
              <li
                key={addr._id}
                className={`paymentpage-billingcard${addr._id === defaultBillingId ? " default" : ""}`}
              >
                <div>
                  <b>{addr.label || "Address"}:</b>{" "}
                  {addr.recipient && <span>{addr.recipient}, </span>}
                  {addr.address}, {addr.city}, {addr.postalCode}, {addr.country}
                  {addr.isDefault && <span className="paymentpage-billing-default"> (Default Billing)</span>}
                </div>
                <div className="paymentpage-billing-actions">
                  <button onClick={() => handleBillingOpenEdit(i)}>Edit</button>
                  <button onClick={() => handleDeleteBilling(addr._id)}>Delete</button>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefaultBilling(addr._id)}>Set as Default</button>
                  )}
                  <button
                    type="button"
                    className={`paymentpage-selectbtn${selectedBillingId === addr._id ? " selected" : ""}`}
                    onClick={() => setSelectedBillingId(addr._id)}
                  >
                    {selectedBillingId === addr._id ? "Selected" : "Use this address"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button className="paymentpage-addbtn" onClick={() => handleBillingOpenEdit(-1)}>
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

      <div className="paymentpage-bottomrow">
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
          className="paymentpage-nextbtn"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
