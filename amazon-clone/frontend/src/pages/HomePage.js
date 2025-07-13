import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { ADD_SEARCH_HISTORY, GET_USERS, REMOVE_SEARCH_HISTORY_ENTRY } from '../graphql/userQueries';
import { GET_RANDOM_PRODUCTS, GET_PRODUCTS_BY_IDS, SEARCH_PRODUCTS } from '../graphql/productQueries';
import { GET_ORDERS_BY_IDS } from '../graphql/orderQueries'; // or wherever your order queries are

export default function HomePage() {
  const { authUser, setAuthUser } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // For search history and suggestions
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
      getSuggestions({ 
        variables: { query, from: 0, size: 5 } 
      });
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
        addSearchHistory({
          variables: { userId: authUser._id, query: realQuery }
        });
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

  // Handle suggestion click
  const handleSuggestionClick = (product) => {
    navigate(`/product/${product._id}`);
    setShowSuggestions(false);
  };

  // Get current user's cart count
  let cartCount = 0;
  if (authUser && data) {
    const currentUser = data.getUsers.find(u => u._id === authUser._id);
    if (currentUser && Array.isArray(currentUser.cart)) {
      cartCount = currentUser.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
  }

  // Recently Viewed Items (show latest 8)
  let viewHistory = [];
  if (authUser && data) {
    const currentUser = data.getUsers.find(u => u._id === authUser._id);
    // alert(JSON.stringify(currentUser.productViewHistory, null, 2))
    // alert("currentUser.productViewHistory.length = " + currentUser.productViewHistory.length);
    if (currentUser && currentUser.productViewHistory) {
      // Remove duplicate product IDs, most recent first
      const seen = new Set();
      viewHistory = currentUser.productViewHistory
        .slice() // clone
        .sort((a, b) => b.timestamp - a.timestamp)
        .filter(entry => {
          if (seen.has(entry.product)) return false;
          //  alert(entry.product);
          seen.add(entry.product);
          return true;
        })
        .slice(0, 15); // Limit to 8
    }
    // alert("viewHistory.length = " + viewHistory.length);
    // alert(JSON.stringify(viewHistory, null, 2))
  }

  // Collect product IDs from viewHistory
  const viewedProductIds = viewHistory.map(entry => entry.product);
  // alert(JSON.stringify(viewedProductIds, null, 2))

  // Fetch product details only if there are IDs
  const { data: viewedProductsData } = useQuery(GET_PRODUCTS_BY_IDS, {
    variables: { ids: viewedProductIds },
    skip: viewedProductIds.length === 0
  });
  // alert(JSON.stringify(viewedProductsData, null, 2))

  // Map products by _id for quick lookup
  const productMap = {};
  if (viewedProductsData && viewedProductsData.getProductsByIds) {
    for (const p of viewedProductsData.getProductsByIds) {
      productMap[p._id] = p;
    }
  }


  let currentUser = null;
  if (authUser && data) {
    currentUser = data.getUsers.find(u => u._id === authUser._id);
  }
  // alert(JSON.stringify(currentUser, null, 2))
  // 1. Get all order IDs from orderHistory
  const orderIds = (currentUser?.orderHistory || []).map(ref => ref.order);
  //  alert(JSON.stringify(orderIds, null, 2));
  // 2. Fetch all order objects by IDs
  
  const { data: ordersData } = useQuery(GET_ORDERS_BY_IDS, {
    variables: { ids: orderIds },
    skip: orderIds.length === 0
  });
  //  alert(JSON.stringify(ordersData, null, 2));
  // 3. Collect unique product IDs from all orders
  let orderHistoryProductIds = [];
  if (ordersData?.getOrdersByIds) {
    const seen = new Set();
    // alert(JSON.stringify(ordersData.getOrdersByIds, null, 2))
    for (const order of ordersData.getOrdersByIds) {
      for (const item of order.orderItems) {
        const pid = item.product;
        if (!seen.has(pid)) {
          orderHistoryProductIds.push(pid);
          seen.add(pid);
        }
      }      
    }
    orderHistoryProductIds = orderHistoryProductIds.slice(0, 15); // Limit if you want
    //alert(JSON.stringify(orderHistoryProductIds, null, 2));
  }

  // alert(JSON.stringify(orderHistoryProductIds, null, 2));

  // Fetch order history products
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
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1300,
        margin: '0 auto',
        background: "transparent",
        padding: "0 0 0 0"
      }}>
        {/* Left Arrow */}
        <button
          aria-label="scroll left"
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            minWidth: 44, minHeight: 44,
            border: "1px solid #bbb",
            borderRadius: "50%",
            background: "#fff",
            fontSize: 32,
            color: "#222",
            boxShadow: "0 1px 5px #eee",
            cursor: "pointer"
          }}
          onClick={() => scrollBy(-1)}
        >&#x2039;</button>
  
        {/* Product Row */}
        <div
          ref={rowRef}
          style={{
            display: "flex",
            overflowX: "auto",
            gap: 18,
            padding: "16px 60px", // Give space for arrows!
            scrollBehavior: "smooth",
            width: "100%",
          }}
        >
          {products.map(product => (
            <div
              key={product._id}
              style={{
                minWidth: 140,
                maxWidth: 140,
                borderRadius: 8,
                padding: 12,
                textAlign: "center",
                cursor: "pointer",
                transition: "box-shadow 0.18s"
              }}
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: 100,
                  height: 70,
                  objectFit: "contain",
                  borderRadius: 8,
                  background: "#f9f9f9"
                }}
              />
              <div style={{
                fontWeight: 500,
                fontSize: 12,
                margin: "6px 0"
              }}>{product.name}</div>
              <div style={{
                color: "#b12704",
                fontWeight: 600,
                fontSize: 12
              }}>${product.price}</div>
            </div>
          ))}
        </div>
  
        {/* Right Arrow */}
        <button
          aria-label="scroll right"
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            minWidth: 44, minHeight: 44,
            border: "1px solid #bbb",
            borderRadius: "50%",
            background: "#fff",
            fontSize: 32,
            color: "#222",
            boxShadow: "0 1px 5px #eee",
            cursor: "pointer"
          }}
          onClick={() => scrollBy(1)}
        >&#x203A;</button>
      </div>
    );
  }

  const { data: randomProductsData, loading: randomLoading, error: randomError } = useQuery(GET_RANDOM_PRODUCTS, {
    variables: { size: 20 },
  });
  const randomProducts = randomProductsData?.getRandomProducts || [];
  //alert(JSON.stringify(randomProducts.length, null, 2));  
  
  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "1rem",
        background: "#232f3e",
        position: "relative"
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
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/product-view-history'); setMenuOpen(false); }}>👀 Product View History</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/order-history'); setMenuOpen(false); }}>📦 Order History</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/unpaid-orders'); setMenuOpen(false); }}>💰 Unpaid Orders</li>
                  <li style={{ padding: "8px 20px", cursor: "pointer" }} onClick={() => { navigate('/cart'); setMenuOpen(false); }}>🛒 Shopping Cart</li>
                </ul>
              </div>
            )}
            <button onClick={handleLogout} style={{ marginRight: 12 }}>Log Out</button>
            {authUser.role === "admin" && (
              <button onClick={() => navigate('/admin')}>Admin Page</button>
            )}
            {authUser.role === "seller" && (
              <button onClick={() => navigate('/seller')}>Seller Page</button>
            )}
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')} style={{ marginRight: 12 }}>Log In</button>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundImage: `url('https://amazonphotoes.s3.us-west-1.amazonaws.com/900w-g_eroZwhOcs.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",        
      }}>
        <h1 style={{ color: "#131921" }}>Amazon Clone Home Page</h1>
        <p>Welcome to the Amazon-like store. Browse products, sign up or log in to shop!</p>

        {/* Updated Search Bar with Suggestions */}
        <div style={{ position: 'relative', margin: '2rem 0', width: 450 }}>
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              border: "2px solid #007185",
              borderRadius: 24,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 2px 6px 0 rgba(0,0,0,0.07)"
            }}
          >
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
          {/* Random Products Section */}
          <div style={{
              width: "100%",
              maxWidth: 1300,
              margin: "40px auto 0 auto",
              padding: "16px 0",
              backgroundImage: `url('https://amazonphotoes.s3.us-west-1.amazonaws.com/homepage_background_image.avif')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              // borderTop: "1px solid #ddd"
            }}>
            <h2 style={{ fontSize: 20, color: "#111", fontWeight: 700, margin: "0 0 18px 18px" }}>
              Discover New Products
            </h2>
            {randomLoading ? (
              <div style={{ textAlign: "center", padding: 32 }}>Loading random products…</div>
            ) : randomError ? (
              <div style={{ color: "red", textAlign: "center" }}>Error loading random products.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[0, 1, 2, 3].map(rowIdx => (
                  <div key={rowIdx} style={{ display: "flex", gap: 18, justifyContent: "center" }}>
                    {randomProducts.slice(rowIdx * 5, (rowIdx + 1) * 5).map(product => (
                      <div
                        key={product._id}
                        style={{
                          minWidth: 150,
                          maxWidth: 160,
                          borderRadius: 8,
                          padding: 14,
                          textAlign: "center",
                          cursor: "pointer",
                          background: "transparent",
                          transition: "box-shadow 0.18s",
                          boxShadow: "0 1px 6px #e3e9ee",
                        }}
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{
                            width: 120,
                            height: 90,
                            objectFit: "contain",
                            borderRadius: 6,
                            marginBottom: 8,
                            background: "transparent",
                          }}
                        />
                        <div style={{
                          fontWeight: 500,
                          fontSize: 15,
                          margin: "6px 0",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,      // Limit to 2 lines
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minHeight: 38,           // For alignment, adjust as needed
                          lineHeight: "1.2"
                        }}>
                          {product.name}
                        </div>
                        <div style={{
                          color: "#b12704",
                          fontWeight: 600,
                          fontSize: 15
                        }}>${product.price}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* products odered */}
        {authUser && orderProducts.length > 0 && (
          <div style={{
            width: "100%",
            maxWidth: 1300,
            margin: "20px auto 0 auto",
            // borderTop: "1px solid #ddd",
            paddingTop: 15,
            background: "transparent",
          }}>
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 0,
              padding: "0 5px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h2 style={{
                  fontSize: 20,
                  color: "#111",
                  fontWeight: 700,
                  margin: 0
                }}>
                  Ordered Products
                </h2>
                {/* Optional: add "View or edit your order history" link here */}
              </div>
            </div>
            {/* Horizontally Scrollable Row */}
            <OrderHistoryRow products={orderProducts} navigate={navigate} />
          </div>
        )}

        {/*view history section*/}
        {authUser && viewHistory.length > 0 && (
          <div style={{
            width: "100%",
            maxWidth: 1300,
            margin: "auto auto 0 auto",
            // borderTop: "1px solid #ddd",
            paddingTop: 15,
            background: "transparent",
          }}>
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
              padding: "0 16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h2 style={{
                  fontSize: 20,
                  color: "#111",
                  fontWeight: 700,
                  margin: 0
                }}>
                  Browsing History
                </h2>
              </div>
            </div>
            {/* Horizontally Scrollable Row */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              position: "relative"
            }}>
              {/* Left Button (add scroll behavior if you want, else just hide if not needed) */}
              <button
                aria-label="scroll left"
                style={{
                  minWidth: 44, minHeight: 44,
                  border: "1px solid #bbb",
                  borderRadius: 10,
                  background: "#fff",
                  fontSize: 32,
                  color: "#222",
                  marginRight: 8,
                  boxShadow: "0 1px 5px #eee",
                  cursor: "pointer"
                }}
                // Optional: Implement scroll logic with a ref
                disabled
              >&#x2039;</button>

              <div
                style={{
                  display: "flex",
                  overflowX: "auto",
                  // gap: 1,
                  paddingBottom: 0,
                  scrollBehavior: "smooth",
                  width: "100%"
                }}
              >
                {viewHistory.map(entry => {
                  const product = productMap[entry.product];
                  if (!product) return null;
                  return (
                    <div
                      key={product._id}
                      style={{
                        minWidth: 140,
                        maxWidth: 140,
                        // border: "1px solid #eee",
                        borderRadius: 8,
                        // boxShadow: "0 2px 8pxrgb(142, 139, 139)",
                        // background: "#fff",
                        padding: 12,
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "box-shadow 0.18s"
                      }}
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: 100,
                          height: 70,
                          objectFit: "contain",
                          borderRadius: 8,
                          // marginBottom: 1,
                          // background: "#f9f9f9"
                        }}
                      />
                      <div style={{
                        fontWeight: 500,
                        fontSize: 12,
                        margin: "6px 0"
                      }}>{product.name}</div>
                      <div style={{
                        color: "#b12704",
                        fontWeight: 600,
                        fontSize: 12
                      }}>${product.price}</div>
                    </div>
                  );
                })}
              </div>

              {/* Right Button (add scroll logic if you want, else just hide if not needed) */}
              <button
                aria-label="scroll right"
                style={{
                  minWidth: 44, minHeight: 44,
                  border: "1px solid #bbb",
                  borderRadius: 10,
                  background: "#fff",
                  fontSize: 32,
                  color: "#222",
                  marginLeft: 8,
                  boxShadow: "0 1px 5px #eee",
                  cursor: "pointer"
                }}
                disabled
              >&#x203A;</button>
            </div>
          </div>
        )}



      </div>
        {/* Footer */}
        <footer
          style={{
            width: "100%",
            marginTop: 0,
            padding: "18px 0",
            background: "#232f3e",
            color: "#fff",
            textAlign: "center",
            fontSize: 16,
            letterSpacing: "0.01em",
            // borderTop: "1px solid #444",
            boxShadow: "0 -1px 10px #0001"
          }}
        >
          © {new Date().getFullYear()} Amazon Clone. All rights reserved. <br />
          This site is a personal project and not affiliated with Amazon.com.
        </footer>

    </div>
    
  );
}