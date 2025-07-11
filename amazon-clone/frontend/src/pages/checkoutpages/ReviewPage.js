import React from "react";
import { useCheckout } from "../../context/CheckoutContext";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS, REMOVE_MANY_FROM_CART } from "../../graphql/userQueries";
import { GET_PRODUCTS } from "../../graphql/productQueries";
import { ADD_ORDER, UPDATE_ORDER, GET_ORDER } from "../../graphql/orderQueries";
import { useNavigate, useLocation } from "react-router-dom";

// Optional: Card icons (if you have an icon component)
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover } from "react-icons/fa";
function cleanAddress(address) {
  if (!address) return address;
  const {
    __typename,
    _id,
    isDefault,    // Remove isDefault if present
    ...cleaned
  } = address;
  return cleaned;
}
function cleanPaymentMethod(pm) {
  if (!pm) return pm;
  const { __typename, _id, isDefault, cvv, billingAddress, ...cleaned } = pm;
  return cleaned;
}


export default function ReviewPage() {
  const { checkoutData, setCheckoutData } = useCheckout();
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");

  // Load cart and products
  const { data } = useQuery(GET_USERS, { skip: !authUser });
  const { data: productsData } = useQuery(GET_PRODUCTS, { fetchPolicy: "network-only" });
  const [removeManyFromCart] = useMutation(REMOVE_MANY_FROM_CART, {
    refetchQueries: [{ query: GET_USERS }]
  });

  // If editing, get current order data
  const { data: orderData } = useQuery(GET_ORDER, { variables: { id: orderId }, skip: !orderId });
  const [addOrder, { loading: adding }] = useMutation(ADD_ORDER, { refetchQueries: [{ query: GET_USERS }] });
  const [updateOrder, { loading: updating }] = useMutation(UPDATE_ORDER, { refetchQueries: [{ query: GET_USERS }] });

  // Selected cart IDs
  const selectedCartIds = React.useMemo(() => {
    const val = sessionStorage.getItem("selectedCartIds");
    if (!val) return [];
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }, []);

  const user = data?.getUsers?.find(u => u._id === authUser?._id);
  const cart = (user?.cart || []).filter(item => selectedCartIds.includes(item.product));
  const productsById = React.useMemo(() => {
    const map = {};
    productsData?.getProducts?.forEach(p => map[p._id] = p);
    return map;
  }, [productsData]);

  const subtotal = cart.reduce((sum, item) => {
    const prod = productsById[item.product];
    return sum + (prod ? prod.price * item.quantity : 0);
  }, 0);
  const shippingPrice = subtotal > 50 ? 0 : 5;
  const taxPrice = +(subtotal * 0.09).toFixed(2);
  const totalPrice = subtotal + shippingPrice + taxPrice;

  const orderItems = cart.map(item => {
    const prod = productsById[item.product];
    return {
      product: item.product,
      name: prod?.name,
      qty: item.quantity,
      price: prod?.price,
      image: prod?.image,
      seller: prod?.seller,
    };
  });

  // ----------- Handlers -----------

  const handlePlaceOrder = async () => {
    try {
      const { shippingAddress, paymentMethod, billingAddress } = checkoutData;
      // For mutation: flatten structure if needed, depending on backend schema
      const paymentMethodForMutation = {
        ...paymentMethod,
        cardholderName: paymentMethod.cardholderName || paymentMethod.nameOnCard,
        expMonth: Number(paymentMethod.expMonth ?? paymentMethod.expiryMonth),
        expYear: Number(paymentMethod.expYear ?? paymentMethod.expiryYear),
      };
      const cleanShippingAddress = cleanAddress(shippingAddress);
      const cleanBillingAddress = cleanAddress(billingAddress);
      const cleanPayment = cleanPaymentMethod(paymentMethodForMutation);
      if (!shippingAddress || !paymentMethod) {
        alert("Shipping address or payment method missing.");
        return;
      }

      if (!orderId && cart.length === 0) {
        alert("No items selected.");
        return;
      }
      if (orderId && orderData?.getOrder) {
        alert("2");
        const res = await updateOrder({
          variables: {
            id: orderId,
            orderItems,
            shippingAddress: cleanShippingAddress,
            billingAddress: cleanBillingAddress,
            paymentMethod: cleanPayment,
            itemsPrice: subtotal,
            shippingPrice,
            taxPrice,
            totalPrice,
            isPaid: true,
            paidAt: new Date().toISOString(),
          },
        });
        navigate(`/checkout/confirmation?orderId=${orderId}`);
      } else {
        alert("1");
        // alert("billingAddress:\n" + JSON.stringify(cleanBillingAddress, null, 2));
        // alert("shippingAddress:\n" + JSON.stringify(cleanShippingAddress, null, 2));
        // alert("payment:\n" + JSON.stringify(cleanPayment, null, 2));
        const res = await addOrder({
          variables: {
            user: authUser._id,
            orderItems,
            shippingAddress: cleanShippingAddress,
            billingAddress: cleanBillingAddress,
            paymentMethod: cleanPayment,
            itemsPrice: subtotal,
            shippingPrice,
            taxPrice,
            totalPrice,
            isPaid: true,
            paidAt: new Date().toISOString(),
          },
        });
        setCheckoutData(d => ({ ...d, order: res.data.addOrder }));
        const purchasedProductIds = orderItems.map(item => item.product);
        await removeManyFromCart({
          variables: {
            userId: authUser._id,
            productIds: purchasedProductIds
          }
        });
        sessionStorage.removeItem("selectedCartIds");
        navigate(`/checkout/confirmation?orderId=${res.data.addOrder._id}`);
      }
      // navigate("/checkout/confirmation");
    } catch (err) {
      alert("Order failed: " + err.message);
    }
  };

  const handlePlaceOrderPayLater = async () => {
    try {
      const { shippingAddress, paymentMethod, billingAddress } = checkoutData;
      const paymentMethodForMutation = {
        ...paymentMethod,
        cardholderName: paymentMethod.cardholderName || paymentMethod.nameOnCard,
        expMonth: Number(paymentMethod.expMonth ?? paymentMethod.expiryMonth),
        expYear: Number(paymentMethod.expYear ?? paymentMethod.expiryYear),
      };
      const cleanShippingAddress = cleanAddress(shippingAddress);
      const cleanBillingAddress = cleanAddress(billingAddress);
      const cleanPayment = cleanPaymentMethod(paymentMethodForMutation);      
      if (!shippingAddress || !paymentMethod) {
        alert("Shipping address or payment method missing.");
        return;
      }
      if (cart.length === 0) {
        alert("No items selected.");
        return;
      }
      if (orderId && orderData?.getOrder) {
        alert("4");
        await updateOrder({
          variables: {
            id: orderId,
            orderItems,
            shippingAddress: cleanShippingAddress,
            billingAddress: cleanBillingAddress,
            paymentMethod: cleanPayment,
            itemsPrice: subtotal,
            shippingPrice,
            taxPrice,
            totalPrice,
            isPaid: false,
            paidAt: null,
          },
        });
      } else {
        alert("3");
        const res = await addOrder({
          variables: {
            user: authUser._id,
            orderItems,
            shippingAddress: cleanShippingAddress,
            billingAddress: cleanBillingAddress,
            paymentMethod: cleanPayment,
            itemsPrice: subtotal,
            shippingPrice,
            taxPrice,
            totalPrice,
            isPaid: false,
          },
        });
        setCheckoutData(d => ({ ...d, order: res.data.addOrder }));
        const purchasedProductIds = orderItems.map(item => item.product);
        await removeManyFromCart({
          variables: {
            userId: authUser._id,
            productIds: purchasedProductIds
          }
        });
        sessionStorage.removeItem("selectedCartIds");
      }
      navigate("/unpaid-orders");
    } catch (err) {
      alert("Order failed: " + err.message);
    }
  };

  if (!authUser) return <div style={{ padding: 32 }}>Please log in.</div>;

  // ----------- UI Renderers -----------

  const renderAddress = (addr, color = "#333") => {
    if (!addr) return <span style={{ color: "#888" }}>(not set)</span>;
    return (
      <div style={{ color }}>
        {addr.recipient && <span>{addr.recipient}, </span>}
        {addr.label && <span>{addr.label}, </span>}
        {addr.address}, {addr.city}, {addr.postalCode}, {addr.country}
      </div>
    );
  };

  const renderPaymentMethod = (pm) => {
    if (!pm) return <span style={{ color: "#888" }}>(not set)</span>;
    // You can show icons if you wish
    const icon = {
      Visa: <FaCcVisa color="#1a1f71" style={{ fontSize: 22, marginRight: 5 }} />,
      MasterCard: <FaCcMastercard color="#eb001b" style={{ fontSize: 22, marginRight: 5 }} />,
      AMEX: <FaCcAmex color="#2e77bb" style={{ fontSize: 22, marginRight: 5 }} />,
      Discover: <FaCcDiscover color="#86b817" style={{ fontSize: 22, marginRight: 5 }} />,
    }[pm.cardType] || null;

    return (
      <div>
        <div>
          {icon}
          <strong>{pm.cardType}</strong> **** {pm.cardNumber?.slice(-4)}
        </div>
        <div>
          <strong>Name:</strong> {pm.cardholderName || pm.nameOnCard}
        </div>
        <div>
          <strong>Expires:</strong> {pm.expMonth ?? pm.expiryMonth}/{pm.expYear ?? pm.expiryYear}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px #eee", padding: 32 }}>
      <h2>Review Your Order</h2>
      <div style={{ marginBottom: 28 }}>
        <strong>Shipping Address:</strong>
        {renderAddress(checkoutData.shippingAddress)}
      </div>
      <div style={{ marginBottom: 28 }}>
        <strong>Billing Address:</strong>
        {renderAddress(checkoutData.billingAddress)}
      </div>
      <div style={{ marginBottom: 28 }}>
        <strong>Payment Method:</strong>
        {renderPaymentMethod(checkoutData.paymentMethod)}
      </div>
      <div style={{ marginBottom: 28 }}>
        <strong>Items:</strong>
        <ul>
          {(orderId && orderData?.getOrder ? orderData.getOrder.orderItems : cart).map((item, i) => {
            const prod = productsById[item.product];
            const quantity = item.qty !== undefined ? item.qty : item.quantity;
            return (
              <li key={i} style={{ marginBottom: 8 }}>
                {prod?.name || item.name} x {quantity} @ ${prod?.price?.toFixed(2) || item.price?.toFixed(2)} = <strong>${prod ? (prod.price * quantity).toFixed(2) : (item.price * quantity).toFixed(2)}</strong>
              </li>
            );
          })}
        </ul>
      </div>
      <div style={{ marginBottom: 24 }}>
        <strong>Subtotal:</strong> ${subtotal.toFixed(2)}<br />
        <strong>Shipping:</strong> ${shippingPrice.toFixed(2)}<br />
        <strong>Tax:</strong> ${taxPrice.toFixed(2)}<br />
        <strong>Total:</strong> <span style={{ color: "#b12704" }}>${totalPrice.toFixed(2)}</span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" onClick={() => navigate("/checkout/payment")}>Back</button>
        <button
          onClick={handlePlaceOrder}
          disabled={adding || updating}
          style={{ background: "#ffd814", marginLeft: 12 }}
        >
          {(adding || updating) ? "Placing Order..." : "Place Your Order"}
        </button>
        <button
          onClick={handlePlaceOrderPayLater}
          disabled={adding || updating}
          style={{ background: "#f7ca00", color: "#222", marginLeft: 12 }}
        >
          {(adding || updating) ? "Saving..." : "Save Order & Pay Later"}
        </button>
      </div>
      <div style={{
        margin: "28px 0",
        padding: "16px",
        background: "#f8f8f8",
        borderRadius: 8,
        fontFamily: "monospace",
        fontSize: 13,
        overflowX: "auto",
        whiteSpace: "pre"
      }}>
        <strong>Order Payload Preview:</strong>
        <pre style={{ marginTop: 10 }}>
          {JSON.stringify({
            user: authUser?._id,
            orderItems,
            shippingAddress: checkoutData.shippingAddress,
            billingAddress: checkoutData.billingAddress,
            paymentMethod: checkoutData.paymentMethod,
            itemsPrice: subtotal,
            shippingPrice,
            taxPrice,
            totalPrice,
            isPaid: true,
            paidAt: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
