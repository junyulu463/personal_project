// pages/menu_pages/UnpaidOrdersPage.js
import { useMutation } from "@apollo/client";
import { REMOVE_UNPAID_ORDER } from "../../graphql/userQueries";
import { DELETE_ORDER } from "../../graphql/orderQueries";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@apollo/client";
import { GET_USERS } from "../../graphql/userQueries";
import { useNavigate } from "react-router-dom";

export default function UnpaidOrdersPage() {
  const { authUser } = useAuth();
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const navigate = useNavigate();

  const { data, loading, error,refetch } = useQuery(GET_USERS, { skip: !authUser, fetchPolicy: "network-only", });

  const [removeUnpaidOrder] = useMutation(REMOVE_UNPAID_ORDER, {
    refetchQueries: [{ query: GET_USERS }]
  });
  const [deleteOrder] = useMutation(DELETE_ORDER, {
    refetchQueries: [{ query: GET_USERS }]
  });

  const handleRemoveOrder = async (orderId) => {
    try {
      await removeUnpaidOrder({ variables: { userId: authUser._id, orderId } });
      await deleteOrder({ variables: { id: orderId } });
      // Optionally show a message or refresh UI
    } catch (err) {
      alert("Failed to remove order: " + err.message);
    }
  };    

  useEffect(() => {
    if (authUser) {
      refetch();
    }
  }, [authUser, refetch]);

  useEffect(() => {
    if (data && authUser) {
      const user = data.getUsers.find(u => u._id === authUser._id);
      setUnpaidOrders(user?.unpaidOrders || []);
    }
  }, [data, authUser]);

  if (!authUser) return <div style={{ padding: 32 }}>Please log in to view your unpaid orders.</div>;
  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', padding: 32 }}>Error: {error.message}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 4,
          padding: '8px 16px',
          marginBottom: 24,
          cursor: 'pointer'
        }}
      >
        ← Back to Home
      </button>
      <h2>💰 Unpaid Orders</h2>
      {unpaidOrders.length === 0 ? (
        <div>No unpaid orders.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {unpaidOrders
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((entry, i) => (
                <li key={i} style={{
                  marginBottom: 16,
                  borderBottom: "1px solid #eee",
                  paddingBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <div>
                    <strong>Order ID:</strong>{" "}
                      <span
                        style={{
                          color: "#1976d2",
                          textDecoration: "underline",
                          cursor: "pointer"
                        }}
                        onClick={() => navigate(`/order/${entry.order}`)}
                      >
                        {entry.order}
                      </span>
                    </div>
                    <div>
                      <strong>Created At:</strong> {new Date(Number(entry.timestamp)).toLocaleString()}
                    </div>
                  </div>
                  <button
                    style={{
                      background: "#ffd814",
                      color: "#111",
                      border: "none",
                      borderRadius: 4,
                      padding: "7px 22px",
                      fontWeight: 600,
                      cursor: "pointer",
                      marginLeft: 24
                    }}
                    onClick={() => navigate(`/checkout/shipping?orderId=${entry.order}`)}
                  >
                    Pay Now
                  </button>
                  <button
                    style={{
                      background: "#fff",
                      color: "#d32f2f",
                      border: "1px solid #d32f2f",
                      borderRadius: 4,
                      padding: "7px 18px",
                      marginLeft: 12,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                    onClick={() => handleRemoveOrder(entry.order)}
                  >
                    Remove
                  </button>
                </li>
            ))}
        </ul>
      )}
    </div>
  );
}
