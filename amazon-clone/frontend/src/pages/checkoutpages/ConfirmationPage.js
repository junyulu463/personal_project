import React, { useEffect } from "react";
import { useCheckout } from "../../context/CheckoutContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_ORDER } from "../../graphql/orderQueries";
import "../../styles/ConfirmationPage.css";

export default function ConfirmationPage() {
  const { setCheckoutData } = useCheckout();
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");

  // Reset checkout context on mount
  useEffect(() => {
    setCheckoutData({
      shippingAddress: {},
      billingAddress: {},
      paymentMethod: "",
      order: null,
    });
  }, [setCheckoutData]);

  const { data, loading, error } = useQuery(GET_ORDER, {
    variables: { id: orderId },
    skip: !orderId,
    fetchPolicy: "network-only",
  });
  const order = data?.getOrder;

  // Address display helper
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

  // Payment summary helper
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

  if (!orderId) {
    return (
      <div className="confirmation-error">
        No order found.<br />
        <button onClick={() => navigate("/")}>Return to Home</button>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="confirmation-loading">
        Loading order...
      </div>
    );
  }
  if (error) {
    return (
      <div className="confirmation-error">
        Failed to load order.<br />
        {error.message}
        <br />
        <button onClick={() => navigate("/")}>Return to Home</button>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="confirmation-error">
        Order not found.<br />
        <button onClick={() => navigate("/")}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <h2>Thank You for Your Order!</h2>
      <div className="confirmation-orderid">
        <strong>Order ID:</strong> {order._id}
      </div>
      <div>
        <strong>Total Paid:</strong>{" "}
        <span className="confirmation-paid">
          ${order.totalPrice?.toFixed(2)}
        </span>
      </div>
      {order.shippingAddress && (
        <div className="confirmation-ship">
          <strong>Shipped to:</strong>
          <div>{renderAddress(order.shippingAddress)}</div>
        </div>
      )}
      {order.billingAddress && (
        <div className="confirmation-bill">
          <strong>Billing Address:</strong>
          <div>{renderAddress(order.billingAddress)}</div>
        </div>
      )}
      {renderPayment(order.paymentMethod)}
      {order.orderItems && order.orderItems.length > 0 && (
        <div className="confirmation-itemswrap">
          <strong>Items:</strong>
          <ul className="confirmation-itemslist">
            {order.orderItems.map((item, i) => (
              <li key={i}>
                {item.name} x {item.qty}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="confirmation-btnwrap">
        <button onClick={() => navigate("/")}>Continue Shopping</button>
      </div>
    </div>
  );
}
