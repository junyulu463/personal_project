import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ORDERS, UPDATE_ORDER } from '../../graphql/orderQueries';
import { GET_PRODUCTS } from '../../graphql/productQueries';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";
import '../../styles/SellerSoldItemsPage.css';

export default function SellerSoldItemsPage() {
  const { authUser } = useAuth();
  const navigate = useNavigate();

  const { data: ordersData, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useQuery(GET_ORDERS);
  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS);
  const [updateOrder] = useMutation(UPDATE_ORDER, { onCompleted: () => refetchOrders() });

  useEffect(() => {
    refetchOrders();
  }, [refetchOrders]);

  if (!authUser || authUser.role !== "seller") {
    return (
      <div className="solditem-accessdenied">
        <h2>Access Denied</h2>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  if (ordersLoading || productsLoading) return <div className="solditem-loading">Loading...</div>;
  if (ordersError) return <div className="solditem-error">{ordersError.message}</div>;

  // Map product IDs to product data for quick access
  const productsById = {};
  (productsData?.getProducts || []).forEach(p => {
    productsById[p._id] = p;
  });

  // Gather all order items sold by this seller
  const soldItems = [];
  (ordersData?.getOrders || []).forEach(order => {
    if (order.isPaid) {
      (order.orderItems || []).forEach(item => {
        if (item.seller === authUser._id) {
          soldItems.push({
            ...item,
            orderId: order._id,
            buyerId: order.user,
            buyerShipping: order.shippingAddress,
            orderDate: order.createdAt,
            deliveredAt: item.deliveredAt,
          });
        }
      });
    }
  });

  soldItems.sort((a, b) => new Date(Number(b.orderDate)) - new Date(Number(a.orderDate)));

  // Handler to deliver an item
  const handleDeliver = async (orderId, item) => {
    try {
      await updateOrder({
        variables: {
          id: orderId,
          orderItems: [{
            product: item.product,
            isDelivered: true,
            deliveredAt: new Date().toISOString()
          }]
        }
      });
    } catch (err) {
      alert("Failed to deliver: " + err.message);
    }
  };

  return (
    <div className="solditem-root">
      <button className="solditem-backbtn" onClick={() => navigate("/seller")}>
        Back to Seller Dashboard
      </button>
      <h2 className="solditem-title">Sold Items</h2>
      {soldItems.length === 0 ? (
        <div className="solditem-empty">No items sold yet.</div>
      ) : (
        <ul className="solditem-list">
          {soldItems.map((item, idx) => (
            <li key={idx} className="solditem-card">
              <div><b>Product:</b> {item.name || productsById[item.product]?.name}</div>
              <div><b>Quantity:</b> {item.qty}</div>
              <div><b>Order Date:</b> {item.orderDate ? new Date(Number(item.orderDate)).toLocaleString() : "-"}</div>
              <div><b>Buyer:</b> {item.buyerId}</div>
              <div>
                <b>Shipping:</b> {item.buyerShipping?.address}{item.buyerShipping?.city && `, ${item.buyerShipping.city}`}
              </div>
              <div>
                <b>Status:</b>{" "}
                {item.isDelivered ? (
                  <span className="solditem-delivered">
                    Delivered{item.deliveredAt && ` on ${new Date(Number(item.deliveredAt)).toLocaleDateString()}`}
                  </span>
                ) : (
                  <span className="solditem-notdelivered">Not Delivered</span>
                )}
              </div>
              {!item.isDelivered && (
                <button
                  className="solditem-deliverbtn"
                  onClick={() => handleDeliver(item.orderId, item)}
                >
                  Mark as Delivered
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
