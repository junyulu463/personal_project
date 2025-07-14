import React from "react";
import { useCheckout } from "../../context/CheckoutContext";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS, REMOVE_MANY_FROM_CART } from "../../graphql/userQueries";
import { GET_PRODUCTS } from "../../graphql/productQueries";
import { ADD_ORDER, UPDATE_ORDER, GET_ORDER } from "../../graphql/orderQueries";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover } from "react-icons/fa";
import "../../styles/ReviewPage.css";

function cleanAddress(address) {
  if (!address) return address;
  const { __typename, _id, isDefault, ...cleaned } = address;
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

  const { data } = useQuery(GET_USERS, { skip: !authUser });
  const { data: productsData } = useQuery(GET_PRODUCTS, { fetchPolicy: "network-only" });
  const [removeManyFromCart] = useMutation(REMOVE_MANY_FROM_CART, {
    refetchQueries: [{ query: GET_USERS }]
  });

  const { data: orderData } = useQuery(GET_ORDER, { variables: { id: orderId }, skip: !orderId });
  const [addOrder, { loading: adding }] = useMutation(ADD_ORDER, { refetchQueries: [{ query: GET_USERS }] });
  const [updateOrder, { loading: updating }] = useMutation(UPDATE_ORDER, { refetchQueries: [{ query: GET_USERS }] });

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

  const handlePlaceOrder = async () => {
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
      if (!orderId && cart.length === 0) {
        alert("No items selected.");
        return;
      }
      if (orderId && orderData?.getOrder) {
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
            isPaid: true,
            paidAt: new Date().toISOString(),
          },
        });
        navigate(`/checkout/confirmation?orderId=${orderId}`);
      } else {
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

  if (!authUser) return <div className="reviewpage-loginmsg">Please log in.</div>;

  const renderAddress = (addr) => {
    if (!addr) return <span className="reviewpage-missing">(not set)</span>;
    return (
      <div className="reviewpage-address">
        {addr.recipient && <span>{addr.recipient}, </span>}
        {addr.label && <span>{addr.label}, </span>}
        {addr.address}, {addr.city}, {addr.postalCode}, {addr.country}
      </div>
    );
  };

  const renderPaymentMethod = (pm) => {
    if (!pm) return <span className="reviewpage-missing">(not set)</span>;
    const icon = {
      Visa: <FaCcVisa color="#1a1f71" className="reviewpage-cardicon" />,
      MasterCard: <FaCcMastercard color="#eb001b" className="reviewpage-cardicon" />,
      AMEX: <FaCcAmex color="#2e77bb" className="reviewpage-cardicon" />,
      Discover: <FaCcDiscover color="#86b817" className="reviewpage-cardicon" />,
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
    <div className="reviewpage-root">
      <h2 className="reviewpage-title">Review Your Order</h2>
      <div className="reviewpage-block">
        <strong>Shipping Address:</strong>
        {renderAddress(checkoutData.shippingAddress)}
      </div>
      <div className="reviewpage-block">
        <strong>Billing Address:</strong>
        {renderAddress(checkoutData.billingAddress)}
      </div>
      <div className="reviewpage-block">
        <strong>Payment Method:</strong>
        {renderPaymentMethod(checkoutData.paymentMethod)}
      </div>
      <div className="reviewpage-block">
        <strong>Items:</strong>
        <ul>
          {(orderId && orderData?.getOrder ? orderData.getOrder.orderItems : cart).map((item, i) => {
            const prod = productsById[item.product];
            const quantity = item.qty !== undefined ? item.qty : item.quantity;
            return (
              <li key={i} className="reviewpage-itemrow">
                <span>{prod?.name || item.name}</span>
                <span>x {quantity}</span>
                <span>@ ${prod?.price?.toFixed(2) || item.price?.toFixed(2)}</span>
                <span className="reviewpage-itemtotal">
                  = <strong>${prod ? (prod.price * quantity).toFixed(2) : (item.price * quantity).toFixed(2)}</strong>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="reviewpage-summary">
        <div><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</div>
        <div><strong>Shipping:</strong> ${shippingPrice.toFixed(2)}</div>
        <div><strong>Tax:</strong> ${taxPrice.toFixed(2)}</div>
        <div><strong>Total:</strong> <span className="reviewpage-grandtotal">${totalPrice.toFixed(2)}</span></div>
      </div>
      <div className="reviewpage-actions">
        <button type="button" className="reviewpage-backbtn" onClick={() => navigate("/checkout/payment")}>Back</button>
        <button
          className="reviewpage-placeorder"
          onClick={handlePlaceOrder}
          disabled={adding || updating}
        >
          {(adding || updating) ? "Placing Order..." : "Place Your Order"}
        </button>
        <button
          className="reviewpage-paylater"
          onClick={handlePlaceOrderPayLater}
          disabled={adding || updating}
        >
          {(adding || updating) ? "Saving..." : "Save Order & Pay Later"}
        </button>
      </div>
    </div>
  );
}
