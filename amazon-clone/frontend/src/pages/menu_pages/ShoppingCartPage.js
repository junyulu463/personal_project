import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_USERS,
  REMOVE_FROM_CART,
  UPDATE_CART_QUANTITY
} from "../../graphql/userQueries";
import { GET_PRODUCTS } from "../../graphql/productQueries";
import { useNavigate } from "react-router-dom";

export default function ShoppingCartPage() {
  const { authUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // For checkbox selection
  const navigate = useNavigate();

  // Mutations
  const [removeFromCart] = useMutation(REMOVE_FROM_CART, {
    refetchQueries: [{ query: GET_USERS }]
  });
  const [updateCartQuantity] = useMutation(UPDATE_CART_QUANTITY, {
    refetchQueries: [{ query: GET_USERS }]
  });

  // Fetch user info and products
  const { data, loading, error } = useQuery(GET_USERS, { skip: !authUser });
  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS, { fetchPolicy: "network-only" });
  //const [loadedOnce, setLoadedOnce] = useState(false);

  // Map productId -> product
  const productsById = useMemo(() => {
    const map = {};
    if (productsData?.getProducts) {
      productsData.getProducts.forEach(prod => {
        map[prod._id] = prod;
      });
    }
    return map;
  }, [productsData]);

  // Load cart from user data, clamp quantities if needed
  useEffect(() => {
    if (data && authUser) {
      const user = data.getUsers.find(u => u._id === authUser._id);
      if (!user) return setCart([]);
      // Clamp each cart item to current stock if needed
      const nextCart = (user.cart || []).map(item => {
        const prod = productsById[item.product];
        if (prod && prod.countInStock < item.quantity) {
          // auto-fix to max in stock
          updateCartQuantity({
            variables: {
              userId: authUser._id,
              productId: item.product,
              quantity: prod.countInStock
            }
          });
          return { ...item, quantity: prod.countInStock };
        }
        return item;
      });
      setCart(nextCart);
      // Default: all in-stock items selected
    // 🚩 Only set default selection on FIRST LOAD
    if (selectedIds.length === 0 && nextCart.length > 0) {
      setSelectedIds(nextCart.filter(item => (productsById[item.product]?.countInStock > 0)).map(item => item.product));
    }
  }
    // eslint-disable-next-line
  }, [data, authUser, productsById,productsData]);

  // Only selected cart items are counted for checkout/subtotal
  const selectedCartItems = cart.filter(item => selectedIds.includes(item.product));

  const subtotal = selectedCartItems.reduce((sum, item) => {
    const prod = productsById[item.product];
    return sum + (prod ? prod.price * item.quantity : 0);
  }, 0);

  const totalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!authUser) return <div style={{ padding: 32 }}>Please log in to view your cart.</div>;
  if (loading || productsLoading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', padding: 32 }}>Error: {error.message}</div>;

  // --- Remove Item Handler (with backend) ---
  const handleRemove = async (productId) => {
    try {
      await removeFromCart({
        variables: {
          userId: authUser._id,
          productId
        }
      });
    } catch (err) {
      alert("Failed to remove item: " + err.message);
    }
  };

  // --- Quantity Increment/Decrement Handler ---
  const handleChangeQuantity = async (productId, newQty, maxQty = 99) => {
    if (newQty < 1) return; // Can't go below 1 (Amazon disables minus at 1)
    if (newQty > maxQty) return; // Can't go above available stock
    try {
      await updateCartQuantity({
        variables: {
          userId: authUser._id,
          productId,
          quantity: newQty
        }
      });
    } catch (err) {
      alert("Failed to update quantity: " + err.message);
    }
  };

  // --- Checkbox for select/deselect items ---
  const handleSelect = (productId) => {
    setSelectedIds(ids => {
      if (ids.includes(productId)) return ids.filter(id => id !== productId);
      return [...ids, productId];
    });
  };

  // Select All checkbox
  const allSelectableIds = cart.filter(item => productsById[item.product]?.countInStock > 0).map(item => item.product);
  const allSelected = allSelectableIds.length > 0 && allSelectableIds.every(id => selectedIds.includes(id));
  const handleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(allSelectableIds);
  };

  // --- Proceed to checkout with only selected items ---
  const handleCheckout = () => {
    if (selectedCartItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }
    // Save selected IDs/items to context/session (so only those go to order/review)
    sessionStorage.setItem("selectedCartIds", JSON.stringify(selectedIds));
    navigate("/checkout/shipping");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
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
      <h2 style={{ marginBottom: 32, color: "#131921" }}>Shopping Cart</h2>

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Left: Cart Items */}
        <div style={{ flex: 2, minWidth: 330 }}>
          {cart.length === 0 ? (
            <div style={{ fontSize: "1.2rem" }}>Your cart is empty.</div>
          ) : (
            <div style={{
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 1px 6px #eee",
              padding: 24
            }}>
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 24 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    style={{ marginRight: 8 }}
                  />
                  Select All ({totalItems} {totalItems === 1 ? "item" : "items"})
                </label>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {cart.map((item, i) => {
                  const prod = productsById[item.product];
                  // if product missing, skip
                  if (!prod) return null;
                  // If out of stock, disable selection and warn
                  const outOfStock = prod.countInStock === 0;
                  // If in cart > in stock, clamp
                  const tooMuch = item.quantity > prod.countInStock;
                  return (
                    <li
                      key={i}
                      style={{
                        borderBottom: "1px solid #eee",
                        paddingBottom: 20,
                        marginBottom: 24,
                        display: "flex",
                        alignItems: "flex-start",
                        opacity: outOfStock ? 0.6 : 1
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.product)}
                        disabled={outOfStock}
                        onChange={() => handleSelect(item.product)}
                        style={{ marginRight: 18, marginTop: 38 }}
                      />
                      <img
                        src={prod.image || ""}
                        alt={prod.name}
                        width={96}
                        height={96}
                        style={{
                          objectFit: "cover",
                          borderRadius: 8,
                          marginRight: 28,
                          border: "1px solid #ddd",
                          background: "#f7f7f7"
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/product/${prod._id}`);
                          }}
                          style={{
                            fontWeight: 600,
                            fontSize: "1.15rem",
                            marginBottom: 6,
                            color: "#007185",
                            cursor: "pointer",
                            textDecoration: "underline"
                          }}
                        >
                          {prod.name}
                        </div>
                        <div style={{ marginBottom: 3 }}>
                          <span style={{ color: "#B12704", fontWeight: 600 }}>${prod.price?.toFixed(2)}</span>
                        </div>
                        {outOfStock && <div style={{ color: "red", fontWeight: 500, marginBottom: 5 }}>Out of stock</div>}
                        {tooMuch && <div style={{ color: "#b12704", fontWeight: 500, marginBottom: 5 }}>Only {prod.countInStock} left, your quantity is updated!</div>}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <strong>Quantity:</strong>
                          <button
                            style={{
                              border: "1px solid #bbb",
                              background: "#fafafa",
                              padding: "2px 8px",
                              borderRadius: 4,
                              cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                              marginLeft: 8
                            }}
                            onClick={() => handleChangeQuantity(item.product, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            title={item.quantity <= 1 ? "Minimum quantity is 1" : "Decrease quantity"}
                          >-</button>
                          <span style={{ minWidth: 30, display: "inline-block", textAlign: "center" }}>{Math.min(item.quantity, prod.countInStock)}</span>
                          <button
                            style={{
                              border: "1px solid #bbb",
                              background: "#fafafa",
                              padding: "2px 8px",
                              borderRadius: 4,
                              cursor: item.quantity >= prod.countInStock ? "not-allowed" : "pointer"
                            }}
                            onClick={() => handleChangeQuantity(item.product, item.quantity + 1, prod.countInStock)}
                            disabled={item.quantity >= prod.countInStock}
                            title={item.quantity >= prod.countInStock ? "No more in stock" : "Increase quantity"}
                          >+</button>
                        </div>
                        {/* Remove item button */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleRemove(item.product);
                          }}
                          style={{
                            marginTop: 10,
                            background: "#fff",
                            color: "#b12704",
                            border: "1px solid #ddd",
                            borderRadius: 4,
                            padding: "6px 16px",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontSize: "0.98rem"
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Right: Cart Summary */}
        <div style={{
          flex: 1,
          minWidth: 260,
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 1px 8px #f4f4f4",
          padding: 26,
          height: "fit-content"
        }}>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 12 }}>
            Subtotal ({totalItems} items): <span style={{ color: "#B12704", fontWeight: 700 }}>${subtotal.toFixed(2)}</span>
          </div>
          <button
            style={{
              background: "#ffd814",
              color: "#222",
              border: "1px solid #e2b400",
              borderRadius: 4,
              padding: "12px 24px",
              fontWeight: "bold",
              fontSize: "1.13rem",
              marginTop: 14,
              width: "100%",
              cursor: selectedCartItems.length === 0 ? "not-allowed" : "pointer",
              opacity: selectedCartItems.length === 0 ? 0.7 : 1
            }}
            disabled={selectedCartItems.length === 0}
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
          <div style={{ marginTop: 16, color: "#555", fontSize: 14 }}>
            Shipping and tax calculated at checkout.<br />
            <span style={{ color: "#777" }}>You can update quantities here. Only selected items will be purchased.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
