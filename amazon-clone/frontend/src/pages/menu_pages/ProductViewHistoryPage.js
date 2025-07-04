import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_USERS,
  REMOVE_PRODUCT_VIEW_ENTRY,
  CLEAR_PRODUCT_VIEW_HISTORY,
} from "../../graphql/userQueries";
import { GET_PRODUCTS } from "../../graphql/productQueries";
import { useNavigate } from "react-router-dom";

export default function ProductViewHistoryPage() {
  const { authUser } = useAuth();
  const [viewHistory, setViewHistory] = useState([]);
  const navigate = useNavigate();

  // Mutations
  const [removeProductViewEntry] = useMutation(REMOVE_PRODUCT_VIEW_ENTRY, {
    refetchQueries: [{ query: GET_USERS }],
  });
  const [clearProductViewHistory] = useMutation(CLEAR_PRODUCT_VIEW_HISTORY, {
    refetchQueries: [{ query: GET_USERS }],
  });

  // Fetch user info from backend
  const { data, loading, error } = useQuery(GET_USERS, {
    skip: !authUser,
    fetchPolicy: "network-only"
  });

  // Fetch all products
  const { data: productsData, loading: loadingProducts } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "network-only",
  });

  // Build a productsById map for quick lookup
  const productsById = useMemo(() => {
    const map = {};
    if (productsData?.getProducts) {
      productsData.getProducts.forEach(prod => {
        map[prod._id] = prod;
      });
    }
    return map;
  }, [productsData]);

  useEffect(() => {
    if (data && authUser) {
      const user = data.getUsers.find(u => u._id === authUser._id);
      setViewHistory(user?.productViewHistory || []);
    }
  }, [data, authUser]);

  if (!authUser) return <div>Please log in to view your product view history.</div>;
  if (loading || loadingProducts) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleDeleteEntry = async (entryId) => {
    if (!authUser?._id || !entryId) return;
    await removeProductViewEntry({
      variables: { userId: authUser._id, entryId }
    });
  };

  const handleClearAll = async () => {
    if (!authUser?._id) return;
    await clearProductViewHistory({
      variables: { userId: authUser._id }
    });
  };

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
      <h2>👀 Product View History</h2>
      <button
        onClick={handleClearAll}
        disabled={viewHistory.length === 0}
        style={{
          marginBottom: 18,
          padding: "6px 14px",
          border: "1px solid #888",
          background: "#f8f9fa",
          color: "#333",
          borderRadius: 4,
          cursor: viewHistory.length === 0 ? "not-allowed" : "pointer"
        }}
      >
        Clear All
      </button>
      {viewHistory.length === 0 ? (
        <div>No products viewed yet.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {viewHistory
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((entry) => {
              const prod = productsById[entry.product];
              return (
                <li key={entry._id} style={{
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                  paddingBottom: 8,
                  cursor: prod ? "pointer" : "default"
                }}
                onClick={() => prod && navigate(`/product/${prod._id}`)}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {prod?.image &&
                      <img
                        src={prod.image}
                        alt={prod.name}
                        width={50}
                        height={50}
                        style={{ objectFit: "cover", borderRadius: 6, marginRight: 12, border: "1px solid #ddd" }}
                      />
                    }
                    <div>
                      <div style={{ fontWeight: 600 }}>{prod ? prod.name : <span style={{ color: "#888" }}>Unknown Product</span>}</div>
                      <div style={{ color: "#777", fontSize: 13 }}>
                        Viewed At: {(() => {
                          if (!entry.timestamp) return "(no date)";
                          if (/^\d+$/.test(entry.timestamp)) {
                            return new Date(Number(entry.timestamp)).toLocaleString();
                          }
                          return new Date(entry.timestamp).toLocaleString();
                        })()}
                      </div>
                    </div>
                  </div>
                  <button
                    style={{
                      marginLeft: 12,
                      padding: "4px 12px",
                      border: "1px solid #d9534f",
                      background: "#fff",
                      color: "#d9534f",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                    onClick={e => {
                      e.stopPropagation(); // Prevent product navigation
                      handleDeleteEntry(entry._id);
                    }}
                  >
                    Delete
                  </button>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
