import React, { useEffect } from "react";
import { useCheckout } from "../../context/CheckoutContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ORDER } from "../../graphql/orderQueries";

export default function ConfirmationPage() {
  const { setCheckoutData } = useCheckout();
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");

  // Clear checkout context on mount (resets for next purchase)
  useEffect(() => {
    setCheckoutData({
      shippingAddress: {},
      billingAddress: {},
      paymentMethod: "",
      order: null,
    });
  }, [setCheckoutData]);

  // Fetch order from backend
  const { data, loading, error } = useQuery(GET_ORDER, {
    variables: { id: orderId },
    skip: !orderId,
    fetchPolicy: "network-only",
  });

  const order = data?.getOrder;

  if (!orderId) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        No order found.<br />
        <button onClick={() => navigate("/")}>Return to Home</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        Loading order...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 32, color: "red", textAlign: "center" }}>
        Failed to load order.<br />
        {error.message}
        <br />
        <button onClick={() => navigate("/")}>Return to Home</button>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        Order not found.<br />
        <button onClick={() => navigate("/")}>Return to Home</button>
      </div>
    );
  }

  // Helper: show payment summary
  const renderPayment = (pm) => {
    if (!pm) return null;
    if (pm.cardType)
      return (
        <div>
          <strong>Paid with:</strong> {pm.cardType} ****{pm.cardNumber?.slice(-4)}
        </div>
      );
    if (typeof pm === "string")
      return (
        <div>
          <strong>Paid with:</strong> {pm}
        </div>
      );
    return null;
  };

  // Helper: show address
  const renderAddress = (addr) => {
    if (!addr) return null;
    return (
      <div>
        {addr.recipient && <span>{addr.recipient}, </span>}
        {addr.label && <span>{addr.label}, </span>}
        {addr.address}, {addr.city}, {addr.postalCode}, {addr.country}
      </div>
    );
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
        textAlign: "center",
      }}
    >
      <h2>Thank You for Your Order!</h2>
      <div style={{ margin: "24px 0" }}>
        <strong>Order ID:</strong> {order._id}
      </div>
      <div>
        <strong>Total Paid:</strong>{" "}
        <span style={{ color: "#b12704" }}>
          ${order.totalPrice?.toFixed(2)}
        </span>
      </div>
      {order.shippingAddress && (
        <div style={{ margin: "16px 0 4px 0" }}>
          <strong>Shipped to:</strong>
          <div>{renderAddress(order.shippingAddress)}</div>
        </div>
      )}
      {order.billingAddress && (
        <div style={{ margin: "8px 0 0 0" }}>
          <strong>Billing Address:</strong>
          <div>{renderAddress(order.billingAddress)}</div>
        </div>
      )}
      {renderPayment(order.paymentMethod)}
      {order.orderItems && order.orderItems.length > 0 && (
        <div style={{ margin: "18px 0 0 0", textAlign: "left" }}>
          <strong>Items:</strong>
          <ul>
            {order.orderItems.map((item, i) => (
              <li key={i}>
                {item.name} x {item.qty}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ marginTop: 30 }}>
        <button onClick={() => navigate("/")}>Continue Shopping</button>
      </div>
    </div>
  );
}
