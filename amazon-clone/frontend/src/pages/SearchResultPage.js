import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { SEARCH_PRODUCTS } from '../graphql/productQueries';
import { ADD_SEARCH_HISTORY, GET_USERS, REMOVE_SEARCH_HISTORY_ENTRY } from '../graphql/userQueries';
import { useAuth } from '../context/AuthContext';
import '../styles/SearchResultPage.css';

export default function SearchResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuth();

  const realPageSize = 10;
  const fetchSize = realPageSize + 1;

  const [query, setQuery] = useState(location.state?.query || '');
  const [page, setPage] = useState(location.state?.page || 0);

  // Main search query
  const [searchProducts, { data, loading, error }] = useLazyQuery(SEARCH_PRODUCTS);
  // Suggestions
  const [getSuggestions, { data: suggestionsData }] = useLazyQuery(SEARCH_PRODUCTS);

  const [addSearchHistory] = useMutation(ADD_SEARCH_HISTORY);
  const [removeSearchHistoryEntry] = useMutation(REMOVE_SEARCH_HISTORY_ENTRY, {
    refetchQueries: [{ query: GET_USERS }]
  });
  const { data: usersData } = useQuery(GET_USERS, { skip: !authUser });

  // Dropdown states and refs
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
      getSuggestions({ variables: { query, from: 0, size: 5 } });
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

  const handleLogout = () => setAuthUser(null);

  const handleSearch = async (e, customQuery) => {
    if (e) e.preventDefault();
    const realQuery = typeof customQuery === 'string' ? customQuery : query;
    if (realQuery.trim()) {
      setPage(0);
      searchProducts({ variables: { query: realQuery, from: 0, size: fetchSize } });
      navigate('.', { replace: true, state: { ...location.state, query: realQuery, page: 0 } });

      if (authUser && authUser._id) {
        addSearchHistory({ variables: { userId: authUser._id, query: realQuery } });
      }
      setDropdownOpen(false);
      setShowAll(false);
      setShowSuggestions(false);
      setQuery(realQuery);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!authUser?._id || !entryId) return;
    await removeSearchHistoryEntry({ variables: { userId: authUser._id, entryId } });
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product._id}`);
    setShowSuggestions(false);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    navigate('.', { replace: true, state: { ...location.state, page: newPage } });
    searchProducts({ variables: { query, from: newPage * realPageSize, size: fetchSize } });
  };

  const handleProductClick = (productId) => navigate(`/product/${productId}`);

  // Get cart count
  let cartCount = 0;
  if (authUser && usersData) {
    const currentUser = usersData.getUsers.find(u => u._id === authUser._id);
    if (currentUser && Array.isArray(currentUser.cart)) {
      cartCount = currentUser.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
  }

  return (
    <div className="searchpage-root">
      {/* Header */}
      <div className="searchpage-header">
        {authUser ? (
          <>
            <span className="searchpage-user">
              Hello, {authUser.username} {authUser.role && <>({authUser.role})</>}
            </span>
            <div className="searchpage-cartwrap">
              <button
                className="searchpage-cartbtn"
                onClick={() => navigate('/cart')}
                title="Shopping Cart"
              >
                <span className="searchpage-carticon">🛒</span>
                Cart
                {cartCount > 0 && (
                  <span className="searchpage-cartcount">{cartCount}</span>
                )}
              </button>
            </div>
            <button
              className="searchpage-menubtn"
              onClick={() => setMenuOpen(open => !open)}
            >
              ☰ Menu
            </button>
            {menuOpen && (
              <div ref={menuRef} className="searchpage-menu">
                <ul>
                  <li onClick={() => { navigate('/profile'); setMenuOpen(false); }}>👤 User Profile</li>
                  <li onClick={() => { navigate('/search-history'); setMenuOpen(false); }}>🔍 Search History</li>
                  <li onClick={() => { navigate('/order-history'); setMenuOpen(false); }}>📦 Order History</li>
                  <li onClick={() => { navigate('/unpaid-orders'); setMenuOpen(false); }}>💰 Unpaid Orders</li>
                  <li onClick={() => { navigate('/cart'); setMenuOpen(false); }}>🛒 Shopping Cart</li>
                  <li onClick={() => { navigate('/product-view-history'); setMenuOpen(false); }}>👀 Product View History</li>
                </ul>
              </div>
            )}
            <button onClick={handleLogout} className="searchpage-logout">Log Out</button>
            {authUser.role === "admin" && <button onClick={() => navigate('/admin')} className="searchpage-admin">Admin Page</button>}
            {authUser.role === "seller" && <button onClick={() => navigate('/seller')} className="searchpage-seller">Seller Page</button>}
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')} className="searchpage-login">Log In</button>
            <button onClick={() => navigate('/signup')} className="searchpage-signup">Sign Up</button>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="searchpage-main">
        <button onClick={() => navigate('/')} className="searchpage-backbtn">
          ← Go Back to Home Page
        </button>
        <h2 className="searchpage-title">Search Results</h2>

        {/* Search Bar */}
        <div className="searchpage-searchwrap">
          <form onSubmit={handleSearch} className="searchpage-searchform">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products…"
              value={query}
              onChange={e => {
                const value = e.target.value;
                setQuery(value);
                if (value) setDropdownOpen(false);
                else setDropdownOpen(historyList.length > 0);
              }}
              onFocus={() => {
                if (query) setShowSuggestions(suggestions.length > 0);
                else setDropdownOpen(historyList.length > 0);
              }}
              autoComplete="off"
            />
            <button type="submit">Search</button>
          </form>
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div ref={dropdownRef} className="searchpage-dropdown">
              <ul>
                {suggestions.map(product => (
                  <li
                    key={product._id}
                    onClick={() => handleSuggestionClick(product)}
                    className="searchpage-suggestitem"
                  >
                    <img src={product.image} alt={product.name} />
                    <div>
                      <div className="searchpage-suggestname">{product.name}</div>
                      <div className="searchpage-suggestprice">${product.price}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* History Dropdown */}
          {dropdownOpen && historyList.length > 0 && query === '' && (
            <div ref={dropdownRef} className="searchpage-dropdown">
              <ul>
                {(showAll ? historyList : historyList.slice(0, 5)).map((entry) => (
                  <li
                    key={entry._id}
                    className={`searchpage-historyitem${query === entry.query ? ' active' : ''}`}
                    onMouseDown={e => {
                      if (e.target.classList.contains('history-delete-cross')) return;
                      setQuery(entry.query);
                      handleSearch(null, entry.query);
                      setDropdownOpen(false);
                    }}
                  >
                    <span>{entry.query}</span>
                    <span
                      className="history-delete-cross"
                      title="Delete"
                      onMouseDown={e => {
                        e.stopPropagation();
                        handleDeleteEntry(entry._id);
                      }}
                    >×</span>
                  </li>
                ))}
              </ul>
              {historyList.length > 5 && (
                <div
                  className="searchpage-historymore"
                  onClick={() => setShowAll(show => !show)}
                >
                  {showAll ? 'Show Less' : 'More'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading && <div className="searchpage-loading">Loading...</div>}
        {error && <div className="searchpage-error">Error: {error.message}</div>}
        {data && data.searchProducts && (
          <>
            {(() => {
              const productsToShow = data.searchProducts.slice(0, realPageSize);
              const hasNextPage = data.searchProducts.length > realPageSize;

              return (
                <>
                  <ul className="searchpage-resultlist">
                    {productsToShow.map(product => (
                      <li
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="searchpage-resultitem"
                      >
                        <div className="searchpage-productmain">
                          <img src={product.image} alt={product.name} />
                          <div>
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                          </div>
                        </div>
                        <div className="searchpage-productinfo">
                          <div className="searchpage-productprice">${product.price}</div>
                          <div>Brand: {product.brand}</div>
                          <div>Category: {product.category}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {/* Pagination */}
                  <div className="searchpage-pagination">
                    <button
                      onClick={() => handlePageChange(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!hasNextPage}
                    >
                      Next
                    </button>
                    <span>Page {page + 1}</span>
                  </div>
                </>
              );
            })()}
          </>
        )}
        {data && data.searchProducts && data.searchProducts.length === 0 && (
          <div className="searchpage-noproducts">No products found.</div>
        )}
      </div>
      {/* Footer */}
      <footer className="searchpage-footer">
        © {new Date().getFullYear()} Amazon Clone. All rights reserved. <br />
        This site is a personal project and not affiliated with Amazon.com.
      </footer>
    </div>
  );
}
