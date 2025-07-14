import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, REMOVE_SEARCH_HISTORY_ENTRY, CLEAR_SEARCH_HISTORY } from '../../graphql/userQueries';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/SearchHistoryPage.css';

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

  if (!authUser) return <div className="shp-loginmsg">Please log in to view your search history.</div>;
  if (loading) return <div className="shp-loading">Loading...</div>;
  if (error) return <div className="shp-error">Error: {error.message}</div>;

  const currentUser = data?.getUsers?.find(u => u._id === authUser._id);
  if (!currentUser) return <div className="shp-error">User not found.</div>;

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

  const handleQueryClick = (query) => {
    navigate('/search', {
      state: {
        query,
        page: 0,
      }
    });
  };

  return (
    <div className="shp-root">
      <button className="shp-backbtn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2 className="shp-title">🔍 Your Search History</h2>
      <button
        className="shp-clearbtn"
        onClick={handleClearAll}
        disabled={currentUser.searchHistory.length === 0}
      >
        Clear All
      </button>
      <ul className="shp-list">
        {currentUser.searchHistory
          .slice()
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((entry) => (
            <li key={entry._id} className="shp-listitem">
              <div
                className="shp-query"
                title="Search again"
                onClick={() => handleQueryClick(entry.query)}
              >
                {entry.query}
                <div className="shp-date">
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
                className="shp-deletebtn"
                onClick={() => handleDeleteEntry(entry._id)}
              >
                Delete
              </button>
            </li>
          ))}
        {currentUser.searchHistory.length === 0 && <li className="shp-empty">No searches yet.</li>}
      </ul>
    </div>
  );
}
