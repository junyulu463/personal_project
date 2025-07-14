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
import "../../styles/ShoppingCartPage.css";

export default function ShoppingCartPage() {
  const { authUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // For checkbox selection
  const navigate = useNavigate();

  const [removeFromCart] = useMutation(REMOVE_FROM_CART, {
    refetchQueries: [{ query: GET_USERS }]
  });
  const [updateCartQuantity] = useMutation(UPDATE_CART_QUANTITY, {
    refetchQueries: [{ query: GET_USERS }]
  });

  const { data, loading, error } = useQuery(GET_USERS, { skip: !authUser });
  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS, { fetchPolicy: "network-only" });

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
      if (!user) return setCart([]);
      const nextCart = (user.cart || []).map(item => {
        const prod = productsById[item.product];
        if (prod && prod.countInStock < item.quantity) {
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
      if (selectedIds.length === 0 && nextCart.length > 0) {
        setSelectedIds(nextCart.filter(item => (productsById[item.product]?.countInStock > 0)).map(item => item.product));
      }
    }
    // eslint-disable-next-line
  }, [data, authUser, productsById, productsData]);

  const selectedCartItems = cart.filter(item => selectedIds.includes(item.product));
  const subtotal = selectedCartItems.reduce((sum, item) => {
    const prod = productsById[item.product];
    return sum + (prod ? prod.price * item.quantity : 0);
  }, 0);
  const totalItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!authUser) return <div className="cart-msg">Please log in to view your cart.</div>;
  if (loading || productsLoading) return <div className="cart-msg">Loading...</div>;
  if (error) return <div className="cart-error">Error: {error.message}</div>;

  const handleRemove = async (productId) => {
    try {
      await removeFromCart({ variables: { userId: authUser._id, productId } });
    } catch (err) {
      alert("Failed to remove item: " + err.message);
    }
  };

  const handleChangeQuantity = async (productId, newQty, maxQty = 99) => {
    if (newQty < 1 || newQty > maxQty) return;
    try {
      await updateCartQuantity({
        variables: { userId: authUser._id, productId, quantity: newQty }
      });
    } catch (err) {
      alert("Failed to update quantity: " + err.message);
    }
  };

  const handleSelect = (productId) => {
    setSelectedIds(ids => (
      ids.includes(productId) ? ids.filter(id => id !== productId) : [...ids, productId]
    ));
  };

  const allSelectableIds = cart.filter(item => productsById[item.product]?.countInStock > 0).map(item => item.product);
  const allSelected = allSelectableIds.length > 0 && allSelectableIds.every(id => selectedIds.includes(id));
  const handleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(allSelectableIds);
  };

  const handleCheckout = () => {
    if (selectedCartItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }
    sessionStorage.setItem("selectedCartIds", JSON.stringify(selectedIds));
    navigate("/checkout/shipping");
  };

  return (
    <div className="cart-root">
      <button className="cart-backbtn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <h2 className="cart-title">Shopping Cart</h2>

      <div className="cart-flex">
        {/* Left: Cart Items */}
        <div className="cart-listwrap">
          {cart.length === 0 ? (
            <div className="cart-empty">Your cart is empty.</div>
          ) : (
            <div className="cart-listbox">
              <div className="cart-selectall">
                <label>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                  Select All ({totalItems} {totalItems === 1 ? "item" : "items"})
                </label>
              </div>
              <ul className="cart-list">
                {cart.map((item, i) => {
                  const prod = productsById[item.product];
                  if (!prod) return null;
                  const outOfStock = prod.countInStock === 0;
                  const tooMuch = item.quantity > prod.countInStock;
                  return (
                    <li key={i} className={`cart-item${outOfStock ? " outofstock" : ""}`}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.product)}
                        disabled={outOfStock}
                        onChange={() => handleSelect(item.product)}
                        className="cart-checkbox"
                      />
                      <img
                        src={prod.image || ""}
                        alt={prod.name}
                        className="cart-img"
                      />
                      <div className="cart-info">
                        <div
                          className="cart-prodlink"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/product/${prod._id}`);
                          }}
                        >
                          {prod.name}
                        </div>
                        <div className="cart-price">${prod.price?.toFixed(2)}</div>
                        {outOfStock && <div className="cart-stockwarn">Out of stock</div>}
                        {tooMuch && <div className="cart-qtywarn">Only {prod.countInStock} left, your quantity is updated!</div>}
                        <div className="cart-qtyrow">
                          <strong>Quantity:</strong>
                          <button
                            className="cart-qtybtn"
                            onClick={() => handleChangeQuantity(item.product, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            title={item.quantity <= 1 ? "Minimum quantity is 1" : "Decrease quantity"}
                          >-</button>
                          <span className="cart-qtynum">{Math.min(item.quantity, prod.countInStock)}</span>
                          <button
                            className="cart-qtybtn"
                            onClick={() => handleChangeQuantity(item.product, item.quantity + 1, prod.countInStock)}
                            disabled={item.quantity >= prod.countInStock}
                            title={item.quantity >= prod.countInStock ? "No more in stock" : "Increase quantity"}
                          >+</button>
                        </div>
                        <button
                          className="cart-removebtn"
                          onClick={e => {
                            e.stopPropagation();
                            handleRemove(item.product);
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
        <div className="cart-summary">
          <div className="cart-subtotal">
            Subtotal ({totalItems} items): <span>${subtotal.toFixed(2)}</span>
          </div>
          <button
            className="cart-checkoutbtn"
            disabled={selectedCartItems.length === 0}
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
          <div className="cart-summarytip">
            Shipping and tax calculated at checkout.<br />
            <span>You can update quantities here. Only selected items will be purchased.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
