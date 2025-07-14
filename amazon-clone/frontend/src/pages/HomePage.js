import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { ADD_SEARCH_HISTORY, GET_USERS, REMOVE_SEARCH_HISTORY_ENTRY } from '../graphql/userQueries';
import { GET_RANDOM_PRODUCTS, GET_PRODUCTS_BY_IDS, SEARCH_PRODUCTS } from '../graphql/productQueries';
import { GET_ORDERS_BY_IDS } from '../graphql/orderQueries';
import '../styles/HomePage.css'; // <-- Import the CSS

export default function HomePage() {
  const { authUser, setAuthUser } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Search history/suggestions
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [addSearchHistory] = useMutation(ADD_SEARCH_HISTORY);
  const [removeSearchHistoryEntry] = useMutation(REMOVE_SEARCH_HISTORY_ENTRY, {
    refetchQueries: [{ query: GET_USERS }]
  });
  const { data } = useQuery(GET_USERS, { skip: !authUser });
  
  // Suggestions query
  const [getSuggestions, { data: suggestionsData }] = useLazyQuery(SEARCH_PRODUCTS);

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

  // Get user's search history
  let historyList = [];
  if (authUser && data) {
    const currentUser = data.getUsers.find(u => u._id === authUser._id);
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

  // Fetch suggestions when query changes
  useEffect(() => {
    if (query && query.length > 1) {
      getSuggestions({ variables: { query, from: 0, size: 5 } });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, getSuggestions]);

  // Update suggestions when data arrives
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
      if (authUser && authUser._id) {
        addSearchHistory({ variables: { userId: authUser._id, query: realQuery } });
      }
      setDropdownOpen(false);
      setShowAll(false);
      setShowSuggestions(false);
      setQuery(realQuery);
      navigate('/search', { state: { query: realQuery } });
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

  // Cart count
  let cartCount = 0;
  if (authUser && data) {
    const currentUser = data.getUsers.find(u => u._id === authUser._id);
    if (currentUser && Array.isArray(currentUser.cart)) {
      cartCount = currentUser.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
  }

  // Recently viewed
  let viewHistory = [];
  if (authUser && data) {
    const currentUser = data.getUsers.find(u => u._id === authUser._id);
    if (currentUser && currentUser.productViewHistory) {
      const seen = new Set();
      viewHistory = currentUser.productViewHistory
        .slice()
        .sort((a, b) => b.timestamp - a.timestamp)
        .filter(entry => {
          if (seen.has(entry.product)) return false;
          seen.add(entry.product);
          return true;
        })
        .slice(0, 15);
    }
  }
  const viewedProductIds = viewHistory.map(entry => entry.product);

  const { data: viewedProductsData } = useQuery(GET_PRODUCTS_BY_IDS, {
    variables: { ids: viewedProductIds },
    skip: viewedProductIds.length === 0
  });
  const productMap = {};
  if (viewedProductsData && viewedProductsData.getProductsByIds) {
    for (const p of viewedProductsData.getProductsByIds) {
      productMap[p._id] = p;
    }
  }

  // Orders
  let currentUser = null;
  if (authUser && data) {
    currentUser = data.getUsers.find(u => u._id === authUser._id);
  }
  const orderIds = (currentUser?.orderHistory || []).map(ref => ref.order);

  const { data: ordersData } = useQuery(GET_ORDERS_BY_IDS, {
    variables: { ids: orderIds },
    skip: orderIds.length === 0
  });

  let orderHistoryProductIds = [];
  if (ordersData?.getOrdersByIds) {
    const seen = new Set();
    for (const order of ordersData.getOrdersByIds) {
      for (const item of order.orderItems) {
        const pid = item.product;
        if (!seen.has(pid)) {
          orderHistoryProductIds.push(pid);
          seen.add(pid);
        }
      }      
    }
    orderHistoryProductIds = orderHistoryProductIds.slice(0, 15);
  }

  const { data: orderProductsData } = useQuery(GET_PRODUCTS_BY_IDS, {
    variables: { ids: orderHistoryProductIds },
    skip: orderHistoryProductIds.length === 0
  });
  const orderProducts = orderProductsData?.getProductsByIds || [];

  function OrderHistoryRow({ products, navigate }) {
    const rowRef = useRef();
    const scrollBy = (dir) => {
      if (rowRef.current) {
        rowRef.current.scrollBy({ left: dir * 260, behavior: "smooth" });
      }
    };
    return (
      <div className="home-row-scrollable">
        <button
          aria-label="scroll left"
          className="home-scroll-arrow"
          style={{ left: 0, position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 2 }}
          onClick={() => scrollBy(-1)}
        >&#x2039;</button>
        <div ref={rowRef} className="home-products-row">
          {products.map(product => (
            <div
              key={product._id}
              className="home-product-mini-card"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <img src={product.image} alt={product.name} />
              <div className="name">{product.name}</div>
              <div className="price">${product.price}</div>
            </div>
          ))}
        </div>
        <button
          aria-label="scroll right"
          className="home-scroll-arrow"
          style={{ right: 0, position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 2 }}
          onClick={() => scrollBy(1)}
        >&#x203A;</button>
      </div>
    );
  }

  // Random products
  const { data: randomProductsData, loading: randomLoading, error: randomError } = useQuery(GET_RANDOM_PRODUCTS, {
    variables: { size: 20 },
  });
  const randomProducts = randomProductsData?.getRandomProducts || [];

  return (
    <div className="home-root">
      {/* Header */}
      <div className="home-header">
        {authUser ? (
          <>
            <span style={{ color: "#fff", marginRight: 16 }}>
              Hello, {authUser.username} {authUser.role && <>({authUser.role})</>}
            </span>
            <div style={{ position: "relative", display: "inline-block", marginRight: 12 }}>
              <button
                style={{
                  background: "#ffd700", color: "#232f3e", borderRadius: 4,
                  border: "none", padding: "6px 12px 6px 32px", fontWeight: "bold",
                  cursor: "pointer", position: "relative"
                }}
                onClick={() => navigate('/cart')}
                title="Shopping Cart"
              >
                <span style={{
                  position: "absolute", left: 8, top: "48%",
                  transform: "translateY(-50%)", fontSize: 20
                }}>🛒</span>
                Cart
                {cartCount > 0 && (
                  <span style={{
                    position: "absolute", top: -10, right: -10,
                    background: "#0076ff", color: "#fff", borderRadius: "50%",
                    minWidth: 22, height: 22, fontSize: 14, fontWeight: "bold",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 1px 4px #3333", border: "2px solid #232f3e", zIndex: 1
                  }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
            <button
              style={{
                marginRight: 12, background: "#fff", color: "#232f3e", borderRadius: 4,
                border: "none", padding: "6px 12px", fontWeight: "bold", cursor: "pointer"
              }}
              onClick={() => setMenuOpen(open => !open)}
            >
              ☰ Menu
            </button>
            {menuOpen && (
              <div ref={menuRef} style={{
                position: "absolute", top: "3.5rem", right: 10, background: "#fff",
                border: "1px solid #ccc", borderRadius: 6, boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                zIndex: 1000, width: 200
              }}>
                <ul style={{ listStyle: "none", padding: "10px 0", margin: 0 }}>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/profile'); setMenuOpen(false); }}>👤 User Profile</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/search-history'); setMenuOpen(false); }}>🔍 Search History</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/product-view-history'); setMenuOpen(false); }}>👀 Product View History</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/order-history'); setMenuOpen(false); }}>📦 Order History</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/unpaid-orders'); setMenuOpen(false); }}>💰 Unpaid Orders</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/cart'); setMenuOpen(false); }}>🛒 Shopping Cart</li>
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
      <div className="home-hero" style={{
        backgroundImage: `url('https://amazonphotoes.s3.us-west-1.amazonaws.com/900w-g_eroZwhOcs.webp')`
      }}>
        <h1 style={{ color: "#131921" }}>Amazon Clone Home Page</h1>
        <p>Welcome to the Amazon-like store. Browse products, sign up or log in to shop!</p>

        {/* Search Bar */}
        <div className="home-searchbar-container">
          <form className="home-searchbar-form" onSubmit={handleSearch}>
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
            <div className="home-search-dropdown" ref={dropdownRef}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {suggestions.map(product => (
                  <li key={product._id}
                    style={{
                      padding: '14px 20px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f4f4f4',
                      display: "flex",
                      alignItems: "center",
                      transition: 'background 0.15s'
                    }}
                    onClick={() => handleSuggestionClick(product)}
                  >
                    <img src={product.image} alt={product.name} width={40} height={40} style={{ marginRight: 12, borderRadius: 4, objectFit: 'cover' }} />
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
            <div className="home-history-dropdown" ref={dropdownRef}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {(showAll ? historyList : historyList.slice(0, 5)).map((entry) => (
                  <li
                    key={entry._id}
                    style={{
                      padding: '14px 20px', cursor: 'pointer', borderBottom: '1px solid #f4f4f4',
                      fontWeight: query === entry.query ? 'bold' : 500,
                      background: query === entry.query ? '#f3fafd' : '#fff',
                      transition: 'background 0.15s',
                      fontSize: "1.05rem", letterSpacing: "0.03em", display: "flex", alignItems: "center"
                    }}
                    onMouseDown={e => {
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
                        fontSize: 22, color: "#222", marginLeft: 10, cursor: "pointer", opacity: 0.8,
                        userSelect: "none", borderRadius: 5, padding: "2px 5px", transition: "background .12s", lineHeight: 1
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
              {historyList.length > 5 && (
                <div
                  style={{
                    textAlign: 'center', padding: "10px 0", cursor: 'pointer', color: '#1976d2',
                    borderTop: '1px solid #f2f2f2', background: showAll ? "#f3fafd" : "#fff",
                    fontWeight: 500, fontSize: "1.07rem"
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

        {/* Random Products */}
        <div className="home-random-products-section"
          style={{ backgroundImage: `url('https://amazonphotoes.s3.us-west-1.amazonaws.com/homepage_background_image.avif')` }}>
          <h2 style={{ fontSize: 20, color: "#111", fontWeight: 700, margin: "0 0 18px 18px" }}>
            Discover New Products
          </h2>
          {randomLoading ? (
            <div style={{ textAlign: "center", padding: 32 }}>Loading random products…</div>
          ) : randomError ? (
            <div style={{ color: "red", textAlign: "center" }}>Error loading random products.</div>
          ) : (
            <div>
              {[0, 1, 2, 3].map(rowIdx => (
                <div key={rowIdx} className="home-random-products-row">
                  {randomProducts.slice(rowIdx * 5, (rowIdx + 1) * 5).map(product => (
                    <div
                      key={product._id}
                      className="home-product-card"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <img src={product.image} alt={product.name} />
                      <div className="name">{product.name}</div>
                      <div className="price">${product.price}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ordered Products */}
        {authUser && orderProducts.length > 0 && (
          <div className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title">Ordered Products</h2>
            </div>
            <OrderHistoryRow products={orderProducts} navigate={navigate} />
          </div>
        )}

        {/* Browsing History */}
        {authUser && viewHistory.length > 0 && (
          <div className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title">Browsing History</h2>
            </div>
            <OrderHistoryRow
              products={viewHistory.map(entry => productMap[entry.product]).filter(Boolean)}
              navigate={navigate}
            />
          </div>
        )}

      </div>
      <footer className="home-footer">
        © {new Date().getFullYear()} Amazon Clone. All rights reserved. <br />
        This site is a personal project and not affiliated with Amazon.com.
      </footer>
    </div>
  );
}
