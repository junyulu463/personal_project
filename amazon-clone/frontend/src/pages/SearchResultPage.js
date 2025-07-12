import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { SEARCH_PRODUCTS } from '../graphql/productQueries';
import { ADD_SEARCH_HISTORY, GET_USERS, REMOVE_SEARCH_HISTORY_ENTRY } from '../graphql/userQueries';
import { useAuth } from '../context/AuthContext';

export default function SearchResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const realPageSize = 10;
  const fetchSize = realPageSize + 1;

  const [query, setQuery] = useState(location.state?.query || '');
  const [page, setPage] = useState(location.state?.page || 0);

  // Main search query
  const [searchProducts, { data, loading, error }] = useLazyQuery(SEARCH_PRODUCTS);
  
  // New: Suggestions query
  const [getSuggestions, { data: suggestionsData }] = useLazyQuery(SEARCH_PRODUCTS);
  
  const [addSearchHistory] = useMutation(ADD_SEARCH_HISTORY);
  const [removeSearchHistoryEntry] = useMutation(REMOVE_SEARCH_HISTORY_ENTRY, {
    refetchQueries: [{ query: GET_USERS }]
  });
  const { data: usersData } = useQuery(GET_USERS, { skip: !authUser });

  // Dropdown states and refs
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- ADDED: Get search history for the current user ---
  let historyList = [];
  if (authUser && usersData) {
    const currentUser = usersData.getUsers.find(u => u._id === authUser._id);
    if (currentUser && currentUser.searchHistory) {
      const seen = new Set();
      historyList = [...currentUser.searchHistory]
        .sort((a, b) => b.timestamp - a.timestamp)
        .filter(entry => {
          const q = entry.query.trim().toLowerCase();
          if (seen.has(q)) return false;
          seen.add(q);
          return true;
        });
    }
  }
  // --- END ADDED ---

  // Close menu and dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
        setShowAll(false);
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial search
  useEffect(() => {
    if (query) {
      searchProducts({ variables: { query, from: page * realPageSize, size: fetchSize } });
    }
    // eslint-disable-next-line
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (query && query.length > 1) {
      getSuggestions({ 
        variables: { query, from: 0, size: 5 } 
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, getSuggestions]);

  // Update suggestions when new data arrives
  useEffect(() => {
    if (suggestionsData && suggestionsData.searchProducts) {
      setSuggestions(suggestionsData.searchProducts);
      setShowSuggestions(query.length > 1);
    }
  }, [suggestionsData, query]);

  const handleLogout = () => {
    setAuthUser(null);
  };

  // --- MODIFIED: handleSearch to support custom query ---
  const handleSearch = async (e, customQuery) => {
    if (e) e.preventDefault();
    const realQuery = typeof customQuery === 'string' ? customQuery : query;
    if (realQuery.trim()) {
      setPage(0);
      searchProducts({ variables: { query: realQuery, from: 0, size: fetchSize } });
      navigate('.', {
        replace: true,
        state: {
          ...location.state,
          query: realQuery,
          page: 0,
        }
      });

      if (authUser && authUser._id) {
        addSearchHistory({ variables: { userId: authUser._id, query: realQuery } });
      }
      setDropdownOpen(false);
      setShowAll(false);
      setShowSuggestions(false);
      setQuery(realQuery);
    }
  };

  // --- ADDED: delete entry handler ---
  const handleDeleteEntry = async (entryId) => {
    if (!authUser?._id || !entryId) return;
    await removeSearchHistoryEntry({ variables: { userId: authUser._id, entryId } });
    // refetch happens via Apollo
  };

  // --- ADDED: handle suggestion click ---
  const handleSuggestionClick = (product) => {
    navigate(`/product/${product._id}`);
    setShowSuggestions(false);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    navigate('.', {
      replace: true,
      state: {
        ...location.state,
        page: newPage,
      },
    });
    searchProducts({ variables: { query, from: newPage * realPageSize, size: fetchSize } });
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Get current user's cart count
  let cartCount = 0;
  if (authUser && usersData) {
    const currentUser = usersData.getUsers.find(u => u._id === authUser._id);
    if (currentUser && Array.isArray(currentUser.cart)) {
      cartCount = currentUser.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#fff'
    }}>
      {/* Header (unchanged) */}
      <div style={{
        display: "flex", justifyContent: "flex-end", alignItems: "center",
        padding: "1rem", background: "#232f3e", position: "relative"
      }}>
        {authUser ? (
          <>
            <span style={{ color: "#fff", marginRight: 16 }}>
              Hello, {authUser.username} {authUser.role && <>({authUser.role})</>}
            </span>
            <div style={{ position: "relative", display: "inline-block", marginRight: 12 }}>
              <button
                style={{
                  background: "#ffd700",
                  color: "#232f3e",
                  borderRadius: 4,
                  border: "none",
                  padding: "6px 12px 6px 32px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  position: "relative"
                }}
                onClick={() => navigate('/cart')}
                title="Shopping Cart"
              >
                <span style={{
                  position: "absolute",
                  left: 8,
                  top: "48%",
                  transform: "translateY(-50%)",
                  fontSize: 20
                }}>🛒</span>
                Cart
                {cartCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    background: "#0076ff",
                    color: "#fff",
                    borderRadius: "50%",
                    minWidth: 22,
                    height: 22,
                    fontSize: 14,
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 1px 4px #3333",
                    border: "2px solid #232f3e",
                    zIndex: 1
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            <button
              style={{
                marginRight: 12,
                background: "#fff",
                color: "#232f3e",
                borderRadius: 4,
                border: "none",
                padding: "6px 12px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
              onClick={() => setMenuOpen(open => !open)}
            >
              ☰ Menu
            </button>
            {menuOpen && (
              <div
                ref={menuRef}
                style={{
                  position: "absolute",
                  top: "3.5rem",
                  right: 10,
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  zIndex: 1000,
                  width: 200
                }}
              >
                <ul style={{ listStyle: "none", padding: "10px 0", margin: 0 }}>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/profile'); setMenuOpen(false); }}>👤 User Profile</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/search-history'); setMenuOpen(false); }}>🔍 Search History</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/order-history'); setMenuOpen(false); }}>📦 Order History</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/unpaid-orders'); setMenuOpen(false); }}>💰 Unpaid Orders</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/cart'); setMenuOpen(false); }}>🛒 Shopping Cart</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/product-view-history'); setMenuOpen(false); }}>👀 Product View History</li>
                </ul>
              </div>
            )}
            <button onClick={handleLogout} style={{ marginRight: 12 }}>Log Out</button>
            {authUser.role === "admin" && <button onClick={() => navigate('/admin')}>Admin Page</button>}
            {authUser.role === "seller" && <button onClick={() => navigate('/seller')}>Seller Page</button>}
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')} style={{ marginRight: 12 }}>Log In</button>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{ padding: '2rem' }}>
        <button onClick={() => navigate('/')} style={{
          background: '#fff', border: '1px solid #ddd',
          borderRadius: 4, padding: '8px 16px', marginBottom: 24,
          cursor: 'pointer'
        }}>
          ← Go Back to Home Page
        </button>

        <h2>Search Results</h2>

        {/* --- UPDATED: Search Bar with History & Suggestions --- */}
        <div style={{ position: 'relative', margin: '2rem 0', width: 400 }}>
          <form onSubmit={handleSearch} style={{
            display: "flex", border: "2px solid #007185",
            borderRadius: 24, overflow: "hidden", background: "#fff", boxShadow: "0 2px 6px 0 rgba(0,0,0,0.07)"
          }}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products…"
              value={query}
              onChange={e => {
                const value = e.target.value;
                setQuery(value);
                if (value) {
                  setDropdownOpen(false);
                } else {
                  setDropdownOpen(historyList.length > 0);
                }
              }}
              onFocus={() => {
                if (query) {
                  setShowSuggestions(suggestions.length > 0);
                } else {
                  setDropdownOpen(historyList.length > 0);
                }
              }}
              style={{
                padding: "14px 18px",
                fontSize: "1.1rem",
                border: "none",
                flex: 1,
                outline: "none",
                background: "none",
                fontWeight: 500,
              }}
              autoComplete="off"
            />
            <button
              type="submit"
              style={{
                padding: "0 30px",
                border: "none",
                background: "#febd69",
                color: "#232f3e",
                fontWeight: "bold",
                fontSize: "1.1rem",
                cursor: "pointer",
                borderRadius: 0,
                transition: "background 0.15s",
              }}
            >
              Search
            </button>
          </form>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: 54,
                left: 0,
                width: "100%",
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: "0 0 18px 18px",
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                zIndex: 999,
                maxHeight: 260,
                overflowY: 'auto',
              }}
            >
              <ul style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}>
                {suggestions.map(product => (
                  <li
                    key={product._id}
                    style={{
                      padding: '14px 20px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f4f4f4',
                      display: "flex",
                      alignItems: "center",
                      transition: 'background 0.15s',
                    }}
                    onClick={() => handleSuggestionClick(product)}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3fafd'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      width={40} 
                      height={40}
                      style={{ marginRight: 12, borderRadius: 4, objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 500 }}>{product.name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>${product.price}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* History Dropdown */}
          {dropdownOpen && historyList.length > 0 && query === '' && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: 54,
                left: 0,
                width: "100%",
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: "0 0 18px 18px",
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                zIndex: 999,
                maxHeight: showAll ? 340 : 260,
                overflowY: showAll ? 'auto' : 'hidden',
                transition: 'max-height 0.2s',
              }}
            >
              {historyList.length === 0 ? (
                <div style={{
                  padding: '14px 20px',
                  color: '#666',
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  No search history
                </div>
              ) : (
                <ul style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  maxHeight: showAll ? 300 : 210,
                  overflowY: showAll ? 'auto' : 'hidden'
                }}>
                  {(showAll ? historyList : historyList.slice(0, 5)).map((entry) => (
                    <li
                      key={entry._id}
                      style={{
                        padding: '14px 20px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f4f4f4',
                        fontWeight: query === entry.query ? 'bold' : 500,
                        background: query === entry.query ? '#f3fafd' : '#fff',
                        transition: 'background 0.15s',
                        fontSize: "1.05rem",
                        letterSpacing: "0.03em",
                        display: "flex",
                        alignItems: "center"
                      }}
                      onMouseDown={e => {
                        // Only trigger search if not clicking the cross
                        if (e.target.classList.contains('history-delete-cross')) return;
                        setQuery(entry.query);
                        handleSearch(null, entry.query);
                        setDropdownOpen(false);
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f3fafd'}
                      onMouseLeave={e => e.currentTarget.style.background = (query === entry.query ? '#f3fafd' : '#fff')}
                    >
                      <span style={{ flex: 1 }}>{entry.query}</span>
                      <span
                        className="history-delete-cross"
                        style={{
                          fontSize: 22,
                          color: "#222",
                          marginLeft: 10,
                          cursor: "pointer",
                          opacity: 0.8,
                          userSelect: "none",
                          borderRadius: 5,
                          padding: "2px 5px",
                          transition: "background .12s",
                          lineHeight: 1,
                        }}
                        title="Delete"
                        onMouseDown={e => {
                          e.stopPropagation();
                          handleDeleteEntry(entry._id);
                        }}
                      >×</span>
                    </li>
                  ))}
                </ul>
              )}
              {historyList.length > 5 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: "10px 0",
                    cursor: 'pointer',
                    color: '#1976d2',
                    borderTop: '1px solid #f2f2f2',
                    background: showAll ? "#f3fafd" : "#fff",
                    fontWeight: 500,
                    fontSize: "1.07rem"
                  }}
                  onClick={() => setShowAll(show => !show)}
                  onMouseEnter={e => e.currentTarget.style.background = "#e3f1ff"}
                  onMouseLeave={e => e.currentTarget.style.background = (showAll ? "#f3fafd" : "#fff")}
                >
                  {showAll ? 'Show Less' : 'More'}
                </div>
              )}
            </div>
          )}
        </div>
        {/* --- END UPDATED: Search Bar --- */}

        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}

        {data && data.searchProducts && (
          <>
            {(() => {
              const productsToShow = data.searchProducts.slice(0, realPageSize);
              const hasNextPage = data.searchProducts.length > realPageSize;

              return (
                <>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {productsToShow.map(product => (
                      <li
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: 8,
                          marginBottom: 16,
                          padding: 16,
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseOver={e => e.currentTarget.style.background = "#f3f7fa"}
                        onMouseOut={e => e.currentTarget.style.background = ""
                        }
                      >
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <img src={product.image} alt={product.name} width={120} style={{ borderRadius: 4 }} />
                        <div style={{ fontWeight: "bold", marginTop: 8 }}>${product.price}</div>
                        <div>Brand: {product.brand}</div>
                        <div>Category: {product.category}</div>
                      </li>
                    ))}
                  </ul>

                  {/* Pagination */}
                  <div style={{ margin: "1rem 0" }}>
                    <button
                      onClick={() => handlePageChange(Math.max(0, page - 1))}
                      disabled={page === 0}
                      style={{ marginRight: 12 }}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!hasNextPage}
                    >
                      Next
                    </button>
                    <span style={{ marginLeft: 12 }}>Page {page + 1}</span>
                  </div>
                </>
              );
            })()}
          </>
        )}

        {data && data.searchProducts && data.searchProducts.length === 0 && (
          <div>No products found.</div>
        )}
      </div>
      <footer
      style={{
        width: "100%",
        marginTop: "auto", // <--- This is key!
        padding: "18px 0",
        background: "#232f3e",
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        letterSpacing: "0.01em",
        borderTop: "1px solid #444",
        boxShadow: "0 -1px 10px #0001"
      }}
    >
      © {new Date().getFullYear()} Amazon Clone. All rights reserved. <br />
      This site is a personal project and not affiliated with Amazon.com.
    </footer>

    </div>
    
  );
}