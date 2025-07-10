// src/pages/menu_pages/OrderDetailPage.js
import React from "react";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { UPDATE_ORDER, CANCEL_ORDER, GET_ORDER } from "../../graphql/orderQueries";
import { useMutation } from "@apollo/client";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_ORDER, { variables: { id } });
  const order = data?.getOrder;

  const allItemsDelivered =
    order &&
    order.orderItems.length > 0 &&
    order.orderItems.every(item => item.isDelivered);

// Optionally, to get the latest deliveredAt among all items:
  const latestDeliveredAt =
    order?.orderItems
      ?.map(item => item.deliveredAt)
      .filter(Boolean)
      .sort()
      .slice(-1)[0];

  const anyItemDelivered =
  order &&
  order.orderItems.length > 0 &&
  order.orderItems.some(item => item.isDelivered);
    

  const [cancelOrder] = useMutation(CANCEL_ORDER, {
    refetchQueries: [{ query: GET_ORDER, variables: { id } }],
  }); 
  const [updateOrder] = useMutation(UPDATE_ORDER, {
    refetchQueries: [{ query: GET_ORDER, variables: { id } }],
  });


  useEffect(() => {
    if (!order) return;
    if (allItemsDelivered && !order.isDelivered) {
      updateOrder({
        variables: {
          id: order._id,
          isDelivered: true,
          deliveredAt: new Date().toISOString()
        }
      });
    } else if (!allItemsDelivered && order.isDelivered) {
      updateOrder({
        variables: {
          id: order._id,
          isDelivered: false,
          deliveredAt: null
        }
      });
    }
  }, [allItemsDelivered, order?.isDelivered,order, updateOrder]);  
       

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await cancelOrder({ variables: { orderId: order._id } });
      alert("Order canceled.");
      navigate(-1);
    } catch (err) {
      alert("Cancel failed: " + err.message);
    }
  };
  
  const handleCancelItem = async (productId) => {
    if (!window.confirm("Are you sure you want to cancel this item?")) return;
    try {
      await cancelOrder({ variables: { orderId: order._id, productId } });
      alert("Item canceled.");
      // Optionally refetch or reload
    } catch (err) {
      alert("Cancel failed: " + err.message);
    }
  };  

  return (
    <div style={{ padding: "2rem" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 4,
          padding: "8px 16px",
          marginBottom: 24,
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h2>Order Details</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "red" }}>Error: {error.message}</div>}
      {order && (
        <div
          style={{
            background: "#fafafa",
            borderRadius: 8,
            boxShadow: "0 1px 4px #f2f2f2",
            padding: 24,
            marginTop: 16,
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <strong>Order ID:</strong> {order._id}
          </div>
          <div style={{ marginBottom: 14 }}>
            <strong>Order Date:</strong>{" "}
            {order.createdAt
              ? new Date(Number(order.createdAt)).toLocaleString()
              : "-"}
          </div>
          {/* Shipping Address */}
          <div style={{ marginBottom: 14 }}>
            <strong>Shipping Address:</strong>
            <div style={{ marginLeft: 16 }}>
              {order.shippingAddress.recipient && (
                <span>
                  <b>{order.shippingAddress.recipient}</b>
                  {" | "}
                </span>
              )}
              {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              {order.shippingAddress.label && (
                <span style={{ marginLeft: 8, color: "#888" }}>
                  ({order.shippingAddress.label})
                </span>
              )}
            </div>
          </div>
          {/* Billing Address */}
          {order.billingAddress && (
            <div style={{ marginBottom: 14 }}>
              <strong>Billing Address:</strong>
              <div style={{ marginLeft: 16 }}>
                {order.billingAddress.recipient && (
                  <span>
                    <b>{order.billingAddress.recipient}</b>
                    {" | "}
                  </span>
                )}
                {order.billingAddress.address}, {order.billingAddress.city},{" "}
                {order.billingAddress.postalCode},{" "}
                {order.billingAddress.country}
                {order.billingAddress.label && (
                  <span style={{ marginLeft: 8, color: "#888" }}>
                    ({order.billingAddress.label})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Payment Method */}
          {order.paymentMethod && (
            <div style={{ marginBottom: 14 }}>
              <strong>Paid With:</strong>{" "}
              {order.paymentMethod.cardType} ending in{" "}
              {order.paymentMethod.cardNumber.slice(-4)} (
              {order.paymentMethod.cardholderName})
              <span style={{ marginLeft: 8 }}>
                exp {order.paymentMethod.expMonth}/
                {order.paymentMethod.expYear}
              </span>
            </div>
          )}

          {/* Items List, per-item delivery status */}
          <div style={{ marginBottom: 18 }}>
            <strong>Items:</strong>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 10 }}>
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
                    cursor: "pointer", // Make the whole row look clickable
                  }}
                  onClick={() => navigate(`/product/${item.product}`)}
                  title="View Product"
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
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 500 }}>{item.name}</span>
                    <span style={{ marginLeft: 12, color: "#555" }}>
                      × {item.qty}
                    </span>
                    {/* Seller ID shown if needed */}
                    {item.seller && (
                      <span style={{ marginLeft: 12, color: "#777" }}>
                        Seller: {item.seller}
                      </span>
                    )}
                    {/* Per-item delivery status */}
                    <span style={{ marginLeft: 14 }}>
                      {item.isDelivered ? (
                        <span style={{ color: "#43a047" }}>
                          Delivered
                          {item.deliveredAt && (
                            <span>
                              {" "}
                              (on{" "}
                              {new Date(Number(item.deliveredAt)).toLocaleDateString()}
                              )
                            </span>
                          )}
                        </span>
                      ) : (
                        <span style={{ color: "#ffa600" }}>Not Delivered</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <strong>
                      {typeof item.price === "number"
                        ? `$${item.price.toFixed(2)}`
                        : item.price
                        ? `$${Number(item.price).toFixed(2)}`
                        : "-"}
                    </strong>
                  </div>

                  {!item.isDelivered && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleCancelItem(item.product);
                      }}
                      style={{
                        marginLeft: 24,
                        background: "#f44336",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "5px 14px",
                        fontWeight: "bold",
                        cursor: "pointer"
                      }}
                    >
                      Cancel Item
                    </button>
                  )}

                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginBottom: 14 }}>
            <strong>Total Paid:</strong>{" "}
            <span style={{ color: "#b12704" }}>
              ${order.totalPrice.toFixed(2)}
            </span>
          </div>

          {/* PAID/NOT PAID SECTION */}
          <div style={{ marginBottom: 14 }}>
            <strong>Payment Status:</strong>{" "}
            {order.isPaid ? (
              <span style={{ color: "#43a047", fontWeight: 600 }}>Paid</span>
            ) : (
              <span style={{ color: "#d9534f", fontWeight: 600 }}>
                Not Paid
              </span>
            )}
            {order.paidAt && order.isPaid && (
              <span style={{ marginLeft: 8, color: "#888" }}>
                (on {new Date(order.paidAt).toLocaleString()})
              </span>
            )}
          </div>

            {/* Overall order delivery status */}
            <div>
              <strong>Status:</strong>{" "}
              {allItemsDelivered ? (
                <span style={{ color: "#43a047" }}>Delivered</span>
              ) : (
                <span style={{ color: "#ffa600" }}>Not Delivered</span>
              )}
              {allItemsDelivered && latestDeliveredAt && (
                <span>
                  {" "}
                  (on {new Date(Number(latestDeliveredAt)).toLocaleDateString()})
                </span>
              )}
            </div>

            {order && (
              <button
                onClick={handleCancelOrder}
                style={{
                  marginTop: 18,
                  background: anyItemDelivered ? "#ccc" : "#d9534f",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "10px 28px",
                  fontWeight: "bold",
                  cursor: anyItemDelivered ? "not-allowed" : "pointer"
                }}
                disabled={anyItemDelivered}
                title={anyItemDelivered ? "Cannot cancel: at least one item is delivered" : "Cancel Order"}
              >
                Cancel Order
              </button>
            )}


            {order && !order.isPaid && (
              <button
                onClick={() => navigate(`/checkout/shipping?orderId=${order._id}`)}
                style={{
                  background: "#ffd814",
                  color: "#222",
                  border: "1px solid #e2b400",
                  borderRadius: 4,
                  padding: "10px 28px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  margin: "18px 0 0 0",
                }}
              >
                Pay Now
              </button>
            )}
        </div>
      )}
    </div>
  );
}
