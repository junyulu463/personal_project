import { useLocation } from "react-router-dom";
import React, { useState } from "react";
import { useCheckout } from "../../context/CheckoutContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ShippingPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");

  const { checkoutData, setCheckoutData } = useCheckout();
  const [form, setForm] = useState({
    recipient: checkoutData.shippingAddress?.recipient || "",
    label: checkoutData.shippingAddress?.label || "",
    address: checkoutData.shippingAddress?.address || "",
    city: checkoutData.shippingAddress?.city || "",
    postalCode: checkoutData.shippingAddress?.postalCode || "",
    country: checkoutData.shippingAddress?.country || "",
  });

  const navigate = useNavigate();
  const { authUser } = useAuth();

  if (!authUser) return <div style={{ padding: 32 }}>Please log in.</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.address || !form.city || !form.postalCode || !form.country) {
      alert("Please complete all fields.");
      return;
    }
    setCheckoutData((d) => ({ ...d, shippingAddress: form }));
    if (orderId) {
      navigate(`/checkout/payment?orderId=${orderId}`);
    } else {
      navigate("/checkout/payment");
    }
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px #eee",
        padding: 32,
      }}
    >
      <h2>Shipping Address</h2>
      <form onSubmit={handleNext}>
        <div>
          <input
            name="recipient"
            value={form.recipient}
            onChange={handleChange}
            placeholder="Recipient (optional)"
            style={{ width: "100%", marginBottom: 12, padding: 8 }}
          />
        </div>
        <div>
          <input
            name="label"
            value={form.label}
            onChange={handleChange}
            placeholder='Label (e.g. "Home", "Work")'
            style={{ width: "100%", marginBottom: 12, padding: 8 }}
          />
        </div>
        <div>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            required
            style={{ width: "100%", marginBottom: 12, padding: 8 }}
          />
        </div>
        <div>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City"
            required
            style={{ width: "100%", marginBottom: 12, padding: 8 }}
          />
        </div>
        <div>
          <input
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
            placeholder="Postal Code"
            required
            style={{ width: "100%", marginBottom: 12, padding: 8 }}
          />
        </div>
        <div>
          <input
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="Country"
            required
            style={{ width: "100%", marginBottom: 12, padding: 8 }}
          />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" onClick={() => navigate(-1)}>
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
