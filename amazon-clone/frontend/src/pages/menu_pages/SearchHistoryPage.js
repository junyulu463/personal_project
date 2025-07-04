import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, REMOVE_SEARCH_HISTORY_ENTRY, CLEAR_SEARCH_HISTORY } from '../../graphql/userQueries';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SearchHistoryPage() {
  const { authUser } = useAuth();
  const navigate = useNavigate();

  const [removeSearchHistoryEntry] = useMutation(REMOVE_SEARCH_HISTORY_ENTRY, {
    refetchQueries: [{ query: GET_USERS }],
  });
  const [clearSearchHistory] = useMutation(CLEAR_SEARCH_HISTORY, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const { data, loading, error } = useQuery(GET_USERS, {
    fetchPolicy: 'network-only',
    skip: !authUser?._id,
  });

  if (!authUser) return <div style={{ padding: 32 }}>Please log in to view your search history.</div>;
  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', padding: 32 }}>Error: {error.message}</div>;

  const currentUser = data?.getUsers?.find(u => u._id === authUser._id);
  if (!currentUser) return <div style={{ padding: 32 }}>User not found.</div>;

  const handleDeleteEntry = async (entryId) => {
    if (!authUser?._id || !entryId) return;
    await removeSearchHistoryEntry({
      variables: { userId: authUser._id, entryId }
    });
  };

  const handleClearAll = async () => {
    if (!authUser?._id) return;
    await clearSearchHistory({
      variables: { userId: authUser._id }
    });
  };

  // Click a history entry to re-search that query
  const handleQueryClick = (query) => {
    navigate('/search', {
      state: {
        query,
        page: 0,
      }
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
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
      <h2>🔍 Your Search History</h2>
      <button
        onClick={handleClearAll}
        disabled={currentUser.searchHistory.length === 0}
        style={{
          marginBottom: 18,
          padding: "6px 14px",
          border: "1px solid #888",
          background: "#f8f9fa",
          color: "#333",
          borderRadius: 4,
          cursor: currentUser.searchHistory.length === 0 ? "not-allowed" : "pointer"
        }}
      >
        Clear All
      </button>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {currentUser.searchHistory
          .slice()
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((entry) => (
            <li key={entry._id} style={{
              padding: "12px 0",
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div
                style={{
                  fontWeight: 'bold',
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: "#1976d2"
                }}
                title="Search again"
                onClick={() => handleQueryClick(entry.query)}
              >
                {entry.query}
                <div style={{ color: "#777", fontSize: 13, fontWeight: 400, textDecoration: "none" }}>
                  {(() => {
                    if (!entry.timestamp) return "(no date)";
                    if (/^\d+$/.test(entry.timestamp)) {
                      return new Date(Number(entry.timestamp)).toLocaleString();
                    }
                    return new Date(entry.timestamp).toLocaleString();
                  })()}
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
                onClick={() => handleDeleteEntry(entry._id)}
              >
                Delete
              </button>
            </li>
          ))}
        {currentUser.searchHistory.length === 0 && <li>No searches yet.</li>}
      </ul>
    </div>
  );
}
