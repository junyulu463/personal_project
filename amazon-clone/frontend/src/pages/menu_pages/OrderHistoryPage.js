import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS } from "../../graphql/userQueries";
import { GET_ORDER, UPDATE_ORDER } from "../../graphql/orderQueries";
import { useNavigate } from "react-router-dom";
import "../../styles/OrderHistoryPage.css";

// Subcomponent for each order
function OrderEntry({ entry }) {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_ORDER, {
    variables: { id: entry.order },
  });
  const order = data?.getOrder;

  const [updateOrder] = useMutation(UPDATE_ORDER, {
    refetchQueries: [{ query: GET_ORDER, variables: { id: entry.order } }],
  });

  useEffect(() => {
    if (!order) return;
    const allItemsDelivered =
      order.orderItems.length > 0 &&
      order.orderItems.every(item => item.isDelivered);
    // Only update if state differs
    if (allItemsDelivered && !order.isDelivered) {
      updateOrder({
        variables: {
          id: order._id,
          isDelivered: true,
          deliveredAt:
            order.orderItems
              .map(i => i.deliveredAt)
              .filter(Boolean)
              .sort()
              .slice(-1)[0] || new Date().toISOString(),
        }
      });
    } else if (!allItemsDelivered && order.isDelivered) {
      updateOrder({
        variables: {
          id: order._id,
          isDelivered: false,
          deliveredAt: null,
        }
      });
    }
  }, [order, updateOrder]);

  return (
    <li className="orderhistory-entry">
      <div>
        <strong>Order ID:</strong>{" "}
        <span
          className="orderhistory-orderid"
          onClick={() => navigate(`/order/${entry.order}`)}
        >
          {entry.order}
        </span>
      </div>
      <div className="orderhistory-time">
        {(() => {
          if (!entry.timestamp) return "(no date)";
          if (/^\d+$/.test(entry.timestamp)) {
            return new Date(Number(entry.timestamp)).toLocaleString();
          }
          return new Date(entry.timestamp).toLocaleString();
        })()}
      </div>
      {loading && (
        <div className="orderhistory-loading">Loading order details...</div>
      )}
      {error && (
        <div className="orderhistory-error">Failed to load order.</div>
      )}
      {order && (
        <>
          {/* Shipping Address */}
          <div className="orderhistory-shipping">
            <strong>Shipping Address:</strong>{" "}
            {order.shippingAddress
              ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
              : <i>(not set)</i>}
          </div>
          {/* Billing Address */}
          {order.billingAddress && (
            <div className="orderhistory-billing">
              <strong>Billing Address:</strong>{" "}
              {`${order.billingAddress.address}, ${order.billingAddress.city}, ${order.billingAddress.postalCode}, ${order.billingAddress.country}`}
            </div>
          )}
          {/* Payment Method Snapshot */}
          {order.paymentMethod && (
            <div className="orderhistory-payment">
              <strong>Paid With:</strong>{" "}
              {order.paymentMethod.cardType} ending in {order.paymentMethod.cardNumber.slice(-4)}
            </div>
          )}
          {/* Items with per-item delivery */}
          <div className="orderhistory-items">
            <strong>Items:</strong>
            <ul className="orderhistory-itemslist">
              {order.orderItems.map((item, idx) => (
                <li
                  key={idx}
                  className="orderhistory-itemrow"
                  onClick={() => navigate(`/product/${item.product}`)}
                  title="View Product"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="orderhistory-itemimg"
                  />
                  <div className="orderhistory-iteminfo">
                    <span className="orderhistory-itemname">{item.name}</span>
                    <span className="orderhistory-itemqty">× {item.qty}</span>
                    <span
                      className={
                        item.isDelivered
                          ? "orderhistory-delivered"
                          : "orderhistory-notdelivered"
                      }
                    >
                      {item.isDelivered ? "Delivered" : "Not Delivered"}
                      {item.deliveredAt && (
                        <span>
                          {" "} (on {new Date(Number(item.deliveredAt)).toLocaleDateString()})
                        </span>
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="orderhistory-total">
            <strong>Total Paid:</strong>{" "}
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
          <div>
            <strong>Order Paid Status:</strong>{" "}
            {order.isPaid ? (
              <span className="orderhistory-paid">Paid</span>
            ) : (
              <span className="orderhistory-notpaid">Not Paid</span>
            )}
            {order.paidAt && (
              <span className="orderhistory-paidat">
                {" "}
                (on {new Date(Number(order.paidAt)).toLocaleDateString()})
              </span>
            )}
          </div>
          <div>
            <strong>Status:</strong>{" "}
            {order.isDelivered ? (
              <span className="orderhistory-delivered">Delivered</span>
            ) : (
              <span className="orderhistory-notdelivered">Not Delivered</span>
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
    </li>
  );
}

export default function OrderHistoryPage() {
  const { authUser } = useAuth();
  const [orderHistory, setOrderHistory] = useState([]);
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    skip: !authUser,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (authUser) refetch();
  }, [authUser, refetch]);

  useEffect(() => {
    if (data && authUser) {
      const user = data.getUsers.find(u => u._id === authUser._id);
      setOrderHistory(user?.orderHistory || []);
    }
  }, [data, authUser]);

  if (!authUser) return <div className="orderhistory-loginmsg">Please log in to view your order history.</div>;
  if (loading) return <div className="orderhistory-loading">Loading...</div>;
  if (error) return <div className="orderhistory-error">Error: {error.message}</div>;

  return (
    <div className="orderhistory-root">
      <button className="orderhistory-backbtn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2 className="orderhistory-title">📦 Order History</h2>
      {orderHistory.length === 0 ? (
        <div className="orderhistory-empty">No orders yet.</div>
      ) : (
        <ul className="orderhistory-list">
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
