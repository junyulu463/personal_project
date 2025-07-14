import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { UPDATE_ORDER, CANCEL_ORDER, GET_ORDER } from "../../graphql/orderQueries";
import "../../styles/OrderDetailPage.css";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_ORDER, { variables: { id } });
  const order = data?.getOrder;

  const allItemsDelivered =
    order &&
    order.orderItems.length > 0 &&
    order.orderItems.every(item => item.isDelivered);

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
  }, [allItemsDelivered, order?.isDelivered, order, updateOrder]);

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
    } catch (err) {
      alert("Cancel failed: " + err.message);
    }
  };

  return (
    <div className="orderdetail-root">
      <button className="orderdetail-backbtn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2 className="orderdetail-title">Order Details</h2>
      {loading && <div className="orderdetail-loading">Loading...</div>}
      {error && <div className="orderdetail-error">Error: {error.message}</div>}
      {order && (
        <div className="orderdetail-card">
          <div className="orderdetail-row">
            <strong>Order ID:</strong> {order._id}
          </div>
          <div className="orderdetail-row">
            <strong>Order Date:</strong>{" "}
            {order.createdAt
              ? new Date(Number(order.createdAt)).toLocaleString()
              : "-"}
          </div>
          {/* Shipping Address */}
          <div className="orderdetail-row">
            <strong>Shipping Address:</strong>
            <div className="orderdetail-addr">
              {order.shippingAddress.recipient && (
                <span>
                  <b>{order.shippingAddress.recipient}</b>
                  {" | "}
                </span>
              )}
              {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              {order.shippingAddress.label && (
                <span className="orderdetail-addrlabel">
                  ({order.shippingAddress.label})
                </span>
              )}
            </div>
          </div>
          {/* Billing Address */}
          {order.billingAddress && (
            <div className="orderdetail-row">
              <strong>Billing Address:</strong>
              <div className="orderdetail-addr">
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
                  <span className="orderdetail-addrlabel">
                    ({order.billingAddress.label})
                  </span>
                )}
              </div>
            </div>
          )}
          {/* Payment Method */}
          {order.paymentMethod && (
            <div className="orderdetail-row">
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
          <div className="orderdetail-row">
            <strong>Items:</strong>
            <ul className="orderdetail-itemslist">
              {order.orderItems.map((item, idx) => (
                <li
                  key={idx}
                  className="orderdetail-itemrow"
                  onClick={() => navigate(`/product/${item.product}`)}
                  title="View Product"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="orderdetail-itemimg"
                  />
                  <div className="orderdetail-iteminfo">
                    <span className="orderdetail-itemname">{item.name}</span>
                    <span className="orderdetail-itemqty">
                      × {item.qty}
                    </span>
                    {item.seller && (
                      <span className="orderdetail-itemseller">
                        Seller: {item.seller}
                      </span>
                    )}
                    <span className="orderdetail-itemstatus">
                      {item.isDelivered ? (
                        <span className="orderdetail-delivered">
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
                        <span className="orderdetail-notdelivered">
                          Not Delivered
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="orderdetail-itemprice">
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
                      className="orderdetail-cancelitem"
                      onClick={e => {
                        e.stopPropagation();
                        handleCancelItem(item.product);
                      }}
                    >
                      Cancel Item
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="orderdetail-row">
            <strong>Total Paid:</strong>{" "}
            <span className="orderdetail-total">
              ${order.totalPrice.toFixed(2)}
            </span>
          </div>
          {/* Payment Status */}
          <div className="orderdetail-row">
            <strong>Payment Status:</strong>{" "}
            {order.isPaid ? (
              <span className="orderdetail-paid">Paid</span>
            ) : (
              <span className="orderdetail-notpaid">Not Paid</span>
            )}
            {order.paidAt && order.isPaid && (
              <span className="orderdetail-paidat">
                (on {new Date(order.paidAt).toLocaleString()})
              </span>
            )}
          </div>
          {/* Order delivery status */}
          <div className="orderdetail-row">
            <strong>Status:</strong>{" "}
            {allItemsDelivered ? (
              <span className="orderdetail-delivered">Delivered</span>
            ) : (
              <span className="orderdetail-notdelivered">Not Delivered</span>
            )}
            {allItemsDelivered && latestDeliveredAt && (
              <span>
                {" "}
                (on {new Date(Number(latestDeliveredAt)).toLocaleDateString()})
              </span>
            )}
          </div>
          {/* Cancel and Pay Now */}
          <div className="orderdetail-actions">
            <button
              className="orderdetail-cancelorder"
              onClick={handleCancelOrder}
              disabled={anyItemDelivered}
              title={
                anyItemDelivered
                  ? "Cannot cancel: at least one item is delivered"
                  : "Cancel Order"
              }
            >
              Cancel Order
            </button>
            {!order.isPaid && (
              <button
                className="orderdetail-paynow"
                onClick={() => navigate(`/checkout/shipping?orderId=${order._id}`)}
              >
                Pay Now
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
