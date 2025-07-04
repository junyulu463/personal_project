// src/pages/menu_pages/OrderHistoryPage.js

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@apollo/client";
// import { useMutation } from "@apollo/client";
import { GET_USERS } from "../../graphql/userQueries";
import {GET_ORDER } from "../../graphql/orderQueries";
import { useNavigate } from "react-router-dom";

// Subcomponent for each order
function OrderEntry({ entry }) {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_ORDER, {
    variables: { id: entry.order },
  });
  const order = data?.getOrder;
  // const [cancelOrder] = useMutation(CANCEL_ORDER, {
  //   refetchQueries: [{ query: GET_USERS }], // refetch user data
  // });

  // const handleCancel = async () => {
  //   if (!window.confirm("Are you sure you want to cancel this order?")) return;
  //   try {
  //     await cancelOrder({ variables: { orderId: entry.order } });
  //     alert("Order canceled successfully.");
  //     // Optionally: reload the page or refetch order here
  //   } catch (err) {
  //     alert("Cancel failed: " + err.message);
  //   }
  // };     

  return (
    <li
      style={{
        marginBottom: 24,
        borderBottom: "1px solid #eee",
        paddingBottom: 16,
        background: "#fafafa",
        borderRadius: 6,
        boxShadow: "0 1px 4px #f2f2f2",
      }}
    >
      <div>
        <strong>Order ID:</strong>{" "}
        <span
          style={{
            color: "#1976d2",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/order/${entry.order}`)}
        >
          {entry.order}
        </span>
      </div>
      <div
        style={{
          color: "#777",
          fontSize: 13,
          fontWeight: 400,
          textDecoration: "none",
        }}
      >
        {(() => {
          if (!entry.timestamp) return "(no date)";
          if (/^\d+$/.test(entry.timestamp)) {
            return new Date(Number(entry.timestamp)).toLocaleString();
          }
          return new Date(entry.timestamp).toLocaleString();
        })()}
      </div>
      {loading && (
        <div style={{ color: "#aaa" }}>Loading order details...</div>
      )}
      {error && (
        <div style={{ color: "red" }}>Failed to load order.</div>
      )}
      {order && (
        <>
          {/* Shipping Address */}
          <div style={{ margin: "10px 0 2px 0" }}>
            <strong>Shipping Address:</strong>{" "}
            {order.shippingAddress
              ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
              : <i>(not set)</i>}
          </div>
          {/* Billing Address */}
          {order.billingAddress && (
            <div style={{ margin: "2px 0 10px 0" }}>
              <strong>Billing Address:</strong>{" "}
              {`${order.billingAddress.address}, ${order.billingAddress.city}, ${order.billingAddress.postalCode}, ${order.billingAddress.country}`}
            </div>
          )}
          {/* Payment Method Snapshot */}
          {order.paymentMethod && (
            <div style={{ margin: "2px 0 10px 0" }}>
              <strong>Paid With:</strong>{" "}
              {order.paymentMethod.cardType} ending in {order.paymentMethod.cardNumber.slice(-4)}
            </div>
          )}
          {/* Items with per-item delivery */}
          <div style={{ margin: "14px 0 6px 0" }}>
            <strong>Items:</strong>
            <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: 10 }}>
              {order.orderItems.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                    background: "#fff",
                    borderRadius: 4,
                    padding: 7,
                    boxShadow: "0 1px 3px #eee",
                    flexWrap: "wrap",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: "cover",
                      borderRadius: 6,
                      marginRight: 14,
                      border: "1px solid #eee",
                      background: "#f7f7f7",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <span style={{ marginLeft: 12, color: "#555" }}>
                      × {item.qty}
                    </span>
                    {/* Per-item delivery status */}
                    <div style={{ marginLeft: 12, color: item.isDelivered ? "#43a047" : "#ffa600", fontSize: 13 }}>
                      {item.isDelivered ? "Delivered" : "Not Delivered"}
                      {item.deliveredAt && (
                        <span>
                          {" "} (on {new Date(Number(item.deliveredAt)).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                    {/* Optionally show Seller */}
                    {/* <div>Seller: {item.seller}</div> */}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 10 }}>
            <strong>Total Paid:</strong>{" "}
            <span style={{ color: "#b12704" }}>
              ${order.totalPrice.toFixed(2)}
            </span>
          </div>
          <div>
            <strong>Order Paid Status:</strong>{" "}
            {order.isPaid ? (
              <span style={{ color: "#43a047" }}>Paid</span>
            ) : (
              <span style={{ color: "#d9534f" }}>Not Paid</span>
            )}
            {order.paidAt && (
              <span>
                {" "}
                (on {new Date(Number(order.paidAt)).toLocaleDateString()})
              </span>
            )}          
          </div>
          <div>
            <strong>Status:</strong>{" "}
            {order.isDelivered ? (
              <span style={{ color: "#43a047" }}>Delivered</span>
            ) : (
              <span style={{ color: "#ffa600" }}>Not Delivered</span>
            )}
            {order.deliveredAt && (
              <span>
                {" "}
                (on {new Date(Number(order.deliveredAt)).toLocaleDateString()})
              </span>
            )}
          </div>            
        </>
      )}
      
      {/* {order && !order.isDelivered && (
        <button
          style={{
            marginTop: 14,
            background: "#d9534f",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "8px 18px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
          onClick={handleCancel}
          disabled={order.isDelivered}
        >
          Cancel Order
        </button>
      )}
      {order && order.isDelivered && (
        <div style={{ marginTop: 14, color: "#888" }}>
          Delivered orders cannot be cancelled.
        </div>
      )} */}

    </li>
  );
}

export default function OrderHistoryPage() {
  const { authUser } = useAuth();
  const [orderHistory, setOrderHistory] = useState([]);
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_USERS, { skip: !authUser });

  useEffect(() => {
    if (data && authUser) {
      const user = data.getUsers.find(u => u._id === authUser._id);
      setOrderHistory(user?.orderHistory || []);
    }
  }, [data, authUser]);

  if (!authUser) return <div style={{ padding: 32 }}>Please log in to view your order history.</div>;
  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', padding: 32 }}>Error: {error.message}</div>;

  return (
    <div style={{ padding: "2rem" }}>
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
      <h2>📦 Order History</h2>
      {orderHistory.length === 0 ? (
        <div>No orders yet.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {orderHistory
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((entry, i) => (
              <OrderEntry key={i} entry={entry} />
            ))}
        </ul>
      )}
    </div>
  );
}
