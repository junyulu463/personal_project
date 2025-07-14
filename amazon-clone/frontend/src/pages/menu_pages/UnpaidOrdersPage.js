import { useMutation } from "@apollo/client";
import { REMOVE_UNPAID_ORDER } from "../../graphql/userQueries";
import { DELETE_ORDER } from "../../graphql/orderQueries";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@apollo/client";
import { GET_USERS } from "../../graphql/userQueries";
import { useNavigate } from "react-router-dom";
import "../../styles/UnpaidOrdersPage.css";

export default function UnpaidOrdersPage() {
  const { authUser } = useAuth();
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    skip: !authUser,
    fetchPolicy: "network-only",
  });

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
    } catch (err) {
      alert("Failed to remove order: " + err.message);
    }
  };

  useEffect(() => {
    if (authUser) refetch();
  }, [authUser, refetch]);

  useEffect(() => {
    if (data && authUser) {
      const user = data.getUsers.find(u => u._id === authUser._id);
      setUnpaidOrders(user?.unpaidOrders || []);
    }
  }, [data, authUser]);

  if (!authUser) return <div className="unpaid-msg">Please log in to view your unpaid orders.</div>;
  if (loading) return <div className="unpaid-msg">Loading...</div>;
  if (error) return <div className="unpaid-error">Error: {error.message}</div>;

  return (
    <div className="unpaid-root">
      <button
        onClick={() => navigate('/')}
        className="unpaid-backbtn"
      >
        ← Back to Home
      </button>
      <h2 className="unpaid-title">💰 Unpaid Orders</h2>
      {unpaidOrders.length === 0 ? (
        <div className="unpaid-empty">No unpaid orders.</div>
      ) : (
        <ul className="unpaid-list">
          {unpaidOrders
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((entry, i) => (
              <li key={i} className="unpaid-item">
                <div className="unpaid-info">
                  <div>
                    <strong>Order ID:</strong>{" "}
                    <span
                      className="unpaid-orderid"
                      onClick={() => navigate(`/order/${entry.order}`)}
                    >
                      {entry.order}
                    </span>
                  </div>
                  <div>
                    <strong>Created At:</strong>{" "}
                    {new Date(Number(entry.timestamp)).toLocaleString()}
                  </div>
                </div>
                <div className="unpaid-btns">
                  <button
                    className="unpaid-paybtn"
                    onClick={() => navigate(`/checkout/shipping?orderId=${entry.order}`)}
                  >
                    Pay Now
                  </button>
                  <button
                    className="unpaid-removebtn"
                    onClick={() => handleRemoveOrder(entry.order)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
