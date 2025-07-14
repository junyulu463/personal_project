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
import "../../styles/ProductViewHistoryPage.css";

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

  if (!authUser) return <div className="pvh-loginmsg">Please log in to view your product view history.</div>;
  if (loading || loadingProducts) return <div className="pvh-loading">Loading...</div>;
  if (error) return <div className="pvh-error">Error: {error.message}</div>;

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
    <div className="pvh-root">
      <button
        className="pvh-backbtn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <h2 className="pvh-title">👀 Product View History</h2>
      <button
        className="pvh-clearbtn"
        onClick={handleClearAll}
        disabled={viewHistory.length === 0}
      >
        Clear All
      </button>
      {viewHistory.length === 0 ? (
        <div className="pvh-empty">No products viewed yet.</div>
      ) : (
        <ul className="pvh-list">
          {viewHistory
            .slice()
            .sort((a, b) => b.timestamp - a.timestamp)
            .map((entry) => {
              const prod = productsById[entry.product];
              return (
                <li
                  key={entry._id}
                  className="pvh-listitem"
                  onClick={() => prod && navigate(`/product/${prod._id}`)}
                  tabIndex={0}
                >
                  <div className="pvh-itemmain">
                    {prod?.image &&
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="pvh-img"
                      />
                    }
                    <div>
                      <div className="pvh-name">{prod ? prod.name : <span className="pvh-unknown">Unknown Product</span>}</div>
                      <div className="pvh-viewedat">
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
                    className="pvh-deletebtn"
                    onClick={e => {
                      e.stopPropagation();
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
