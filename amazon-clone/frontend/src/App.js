// App.js
// import React, { useState } from "react";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminPage from "./pages/AdminPage"; // <-- Import
import SellerPage from "./pages/SellerPage";
import AddProductPage from "./pages/AddProductPage";
import EditProductPage from "./pages/EditProductPage";
import SearchResultPage from "./pages/SearchResultPage";
import ProductViewHistoryPage from "./pages/menu_pages/ProductViewHistoryPage";
import SearchHistoryPage from "./pages/menu_pages/SearchHistoryPage";
import UserProfilePage from './pages/menu_pages/UserProfilePage';
import OrderHistoryPage from './pages/menu_pages/OrderHistoryPage';
import UnpaidOrdersPage from './pages/menu_pages/UnpaidOrdersPage';
import ShoppingCartPage from './pages/menu_pages/ShoppingCartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ShippingPage from './pages/checkoutpages/ShippingPage';
import PaymentPage from './pages/checkoutpages/PaymentPage';
import ReviewPage from './pages/checkoutpages/ReviewPage';
import ConfirmationPage from './pages/checkoutpages/ConfirmationPage';
import OrderDetailPage from "./pages/menu_pages/OrderDetailPage";
import SellerSoldItemsPage from './pages/seller/SellerSoldItemsPage';



export const AuthContext = React.createContext();

function App() {
  // const [authUser, setAuthUser] = useState(null);

  return (
    // <AuthContext.Provider value={{ authUser, setAuthUser }}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/seller" element={<SellerPage />} />
          <Route path="/seller/add" element={<AddProductPage />} />
          <Route path="/seller/edit/:id" element={<EditProductPage />} />
          <Route path="/admin" element={<AdminPage />} /> {/* <-- Add this */}
          <Route path="/search" element={<SearchResultPage />} />
          <Route path="/product-view-history" element={<ProductViewHistoryPage />} />
          <Route path="/search-history" element={<SearchHistoryPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/order-history" element={<OrderHistoryPage />} />
          <Route path="/unpaid-orders" element={<UnpaidOrdersPage />} />
          <Route path="/cart" element={<ShoppingCartPage />} />  
          <Route path="/product/:id" element={<ProductDetailPage />} />   
          <Route path="/checkout/shipping" element={<ShippingPage />} />
          <Route path="/checkout/payment" element={<PaymentPage />} />
          <Route path="/checkout/review" element={<ReviewPage />} />
          <Route path="/checkout/confirmation" element={<ConfirmationPage />} /> 
          <Route path="/order/:id" element={<OrderDetailPage />} />  
          <Route path="/seller/orders" element={<SellerSoldItemsPage />} />
        </Routes>
      </Router>
    // </AuthContext.Provider>
  );
}

export default App;
