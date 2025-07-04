import React from 'react';
import { useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ORDERS, UPDATE_ORDER } from '../../graphql/orderQueries';
import { GET_PRODUCTS} from '../../graphql/productQueries';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";

export default function SellerSoldItemsPage() {
  const { authUser } = useAuth();
  const navigate = useNavigate();

  const { data: ordersData, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useQuery(GET_ORDERS);
  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS);
  const [updateOrder] = useMutation(UPDATE_ORDER, { onCompleted: () => refetchOrders() });
  //const [updateProduct] = useMutation(UPDATE_PRODUCT, { refetchQueries: [{ query: GET_PRODUCTS }] });
  // Fetch orders when the page is entered/mounted
  useEffect(() => {
    refetchOrders();
  }, [refetchOrders]);

  if (!authUser || authUser.role !== "seller") {
    return (
      <div style={{ padding: 40 }}>
        <h2>Access Denied</h2>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  if (ordersLoading || productsLoading) return <div>Loading...</div>;
  if (ordersError) return <div style={{ color: "red" }}>{ordersError.message}</div>;

  // Map product IDs to product data for quick stock access
  const productsById = {};
  (productsData?.getProducts || []).forEach(p => {
    productsById[p._id] = p;
  });

  // Gather all order items sold by this seller
  const soldItems = [];
  (ordersData?.getOrders || []).forEach(order => {
    // Only process paid orders
    if (order.isPaid) {
      (order.orderItems || []).forEach(item => {
        if (item.seller === authUser._id) {
          soldItems.push({
            ...item,
            orderId: order._id,
            buyerId: order.user,
            buyerShipping: order.shippingAddress,
            orderDate: order.createdAt,
          });
        }
      });
    }
  });
  
  soldItems.sort((a, b) => new Date(Number(b.orderDate)) - new Date(Number(a.orderDate)));

  // Handler to deliver an item
  const handleDeliver = async (orderId, item) => {
    try {
      // 1. Mark item as delivered in order
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

      // 2. Decrement product stock
    //   const prod = productsById[item.product];
    //   if (prod) {
    //     await updateProduct({
    //       variables: {
    //         id: item.product,
    //         countInStock: Math.max(0, prod.countInStock - item.qty)
    //       }
    //     });
    //   }
    //   alert("Marked as delivered!");
    } catch (err) {
      alert("Failed to deliver: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <button onClick={() => navigate("/seller")} style={{ marginBottom: 20 }}>
        Back to Seller Dashboard
      </button>
      <h2>Sold Items</h2>
      {soldItems.length === 0 ? (
        <div>No items sold yet.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {soldItems.map((item, idx) => (
            <li key={idx} style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 16,
              marginBottom: 18,
              background: "#fafafa"
            }}>
              <div><b>Product:</b> {item.name}</div>
              <div><b>Quantity:</b> {item.qty}</div>
              <div><b>Order Date:</b> {item.orderDate ? new Date(Number(item.orderDate)).toLocaleString() : "-"}</div>
              <div><b>Buyer:</b> {item.buyerId}</div>
              <div><b>Shipping:</b> {item.buyerShipping?.address}, {item.buyerShipping?.city}</div>
              <div>
                <b>Status:</b> {
                  item.isDelivered
                    ? <span style={{ color: "green" }}>Delivered {item.deliveredAt && `on ${new Date(Number(item.deliveredAt)).toLocaleDateString()}`}</span>
                    : <span style={{ color: "orange" }}>Not Delivered</span>
                }
              </div>
              {!item.isDelivered && (
                <button
                  onClick={() => handleDeliver(item.orderId, item)}
                  style={{ marginTop: 10, background: "#ffd814", padding: "6px 16px", borderRadius: 4, fontWeight: "bold" }}
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
