import { useLocation } from "react-router-dom";
import React, { useState } from "react";
import { useCheckout } from "../../context/CheckoutContext";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");

  const { checkoutData, setCheckoutData } = useCheckout();

  // Only Credit Card fields
  const [cardInfo, setCardInfo] = useState({
    cardType: checkoutData.paymentMethod?.cardType || "",
    cardNumber: checkoutData.paymentMethod?.cardNumber || "",
    nameOnCard: checkoutData.paymentMethod?.nameOnCard || "",
    expiryMonth: checkoutData.paymentMethod?.expiryMonth || "",
    expiryYear: checkoutData.paymentMethod?.expiryYear || "",
    cvv: checkoutData.paymentMethod?.cvv || "",
  });

  // Billing address fields (allow user to copy shipping or enter new)
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    recipient: "",
    label: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const navigate = useNavigate();

  // Copy shipping address if checkbox is selected
  React.useEffect(() => {
    if (useShippingAsBilling && checkoutData.shippingAddress) {
      setBillingAddress({ ...checkoutData.shippingAddress });
    }
  }, [useShippingAsBilling, checkoutData.shippingAddress]);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardInfo((ci) => ({ ...ci, [name]: value }));
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress((ba) => ({ ...ba, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();

    // Credit Card validation only
    if (
      !cardInfo.cardType ||
      !cardInfo.cardNumber ||
      !cardInfo.nameOnCard ||
      !cardInfo.expiryMonth ||
      !cardInfo.expiryYear ||
      !cardInfo.cvv
    ) {
      alert("Please fill out all card details.");
      return;
    }
    if (
      !billingAddress.address ||
      !billingAddress.city ||
      !billingAddress.postalCode ||
      !billingAddress.country
    ) {
      alert("Please complete billing address.");
      return;
    }

    setCheckoutData((d) => ({
      ...d,
      paymentMethod: {
        type: "Credit Card",
        ...cardInfo,
      },
      billingAddress: { ...billingAddress },
    }));

    if (orderId) {
      navigate(`/checkout/review?orderId=${orderId}`);
    } else {
      navigate("/checkout/review");
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px #eee",
        padding: 32,
      }}
    >
      <h2>Payment Method</h2>
      <form onSubmit={handleNext}>
        <div style={{ marginBottom: 20 }}>
          <div>
            <select
              name="cardType"
              value={cardInfo.cardType}
              onChange={handleCardChange}
              required
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            >
              <option value="">Select Card Type</option>
              <option value="Visa">Visa</option>
              <option value="MasterCard">MasterCard</option>
              <option value="Discover">Discover</option>
              <option value="AMEX">AMEX</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              name="cardNumber"
              value={cardInfo.cardNumber}
              onChange={handleCardChange}
              placeholder="Card Number"
              required
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />
          </div>
          <div>
            <input
              type="text"
              name="nameOnCard"
              value={cardInfo.nameOnCard}
              onChange={handleCardChange}
              placeholder="Name on Card"
              required
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="number"
              name="expiryMonth"
              value={cardInfo.expiryMonth}
              onChange={handleCardChange}
              placeholder="MM"
              min="1"
              max="12"
              required
              style={{ width: "50%", marginBottom: 10, padding: 8 }}
            />
            <input
              type="number"
              name="expiryYear"
              value={cardInfo.expiryYear}
              onChange={handleCardChange}
              placeholder="YYYY"
              min={new Date().getFullYear()}
              required
              style={{ width: "50%", marginBottom: 10, padding: 8 }}
            />
          </div>
          <div>
            <input
              type="password"
              name="cvv"
              value={cardInfo.cvv}
              onChange={handleCardChange}
              placeholder="CVV"
              required
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />
          </div>

          {/* Billing Address Section */}
          <div style={{ marginTop: 18 }}>
            <label>
              <input
                type="checkbox"
                checked={useShippingAsBilling}
                onChange={(e) => setUseShippingAsBilling(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Use shipping address as billing address
            </label>
          </div>
          {!useShippingAsBilling && (
            <div>
              <input
                name="recipient"
                value={billingAddress.recipient}
                onChange={handleBillingChange}
                placeholder="Recipient (optional)"
                style={{ width: "100%", marginBottom: 10, padding: 8 }}
              />
              <input
                name="label"
                value={billingAddress.label}
                onChange={handleBillingChange}
                placeholder='Label (e.g. "Home", "Work")'
                style={{ width: "100%", marginBottom: 10, padding: 8 }}
              />
              <input
                name="address"
                value={billingAddress.address}
                onChange={handleBillingChange}
                placeholder="Billing Address"
                required
                style={{ width: "100%", marginBottom: 10, padding: 8 }}
              />
              <input
                name="city"
                value={billingAddress.city}
                onChange={handleBillingChange}
                placeholder="City"
                required
                style={{ width: "100%", marginBottom: 10, padding: 8 }}
              />
              <input
                name="postalCode"
                value={billingAddress.postalCode}
                onChange={handleBillingChange}
                placeholder="Postal Code"
                required
                style={{ width: "100%", marginBottom: 10, padding: 8 }}
              />
              <input
                name="country"
                value={billingAddress.country}
                onChange={handleBillingChange}
                placeholder="Country"
                required
                style={{ width: "100%", marginBottom: 10, padding: 8 }}
              />
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
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
            type="submit"
            style={{ background: "#ffd814", marginLeft: 12 }}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
