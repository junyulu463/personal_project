import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { GET_PRODUCTS, DELETE_PRODUCT } from '../graphql/productQueries';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from "react-router-dom";
import { GET_ORDERS } from '../graphql/orderQueries';
import { FiPackage } from "react-icons/fi";
import '../styles/SellerPage.css';  // <-- import the CSS file!

const DELETE_S3_FILE = gql`
  mutation DeleteS3File($key: String!) {
    deleteS3File(key: $key)
  }
`;

export default function SellerPage() {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);
  const [deleteS3File] = useMutation(DELETE_S3_FILE);
  const location = useLocation();
  const [pendingScroll, setPendingScroll] = React.useState(null);
  const { data: ordersData } = useQuery(GET_ORDERS, {
    variables: { sellerId: authUser?._id },
    skip: !authUser?._id,
    fetchPolicy: "network-only"
  });

  React.useEffect(() => {
    if (location.state?.refresh) {
      setPendingScroll(location.state.scrollY || 0);
      refetch();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);

  React.useEffect(() => {
    if (pendingScroll !== null && data?.getProducts?.length > 0) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: pendingScroll, behavior: 'auto' });
          setPendingScroll(null);
        });
      });
    }
  }, [pendingScroll, data]);

  const extractS3Key = (url) => {
    try {
      const { pathname } = new URL(url);
      const key = decodeURIComponent(pathname.slice(1));
      return key;
    } catch {
      return null;
    }
  };

  const handleDelete = async (id) => {
    try {
      await refetch();
      const latest = await refetch();
      const products = latest.data.getProducts;
      const productToDelete = products.find(prod => prod._id === id);

      if (productToDelete) {
        const allUrls = [
          productToDelete.image,
          ...(productToDelete.images || []),
          ...(productToDelete.videos || []),
        ].filter(Boolean);

        for (const url of allUrls) {
          const key = extractS3Key(url);
          if (key) {
            try {
              await deleteS3File({ variables: { key } });
            } catch {}
          }
        }
      }
      await deleteProduct({ variables: { id } });
      refetch();
    } catch (err) {
      alert(err.message || "Error deleting product");
    }
  };

  if (!authUser || authUser.role !== "seller") {
    return (
      <div className="seller-page-denied">
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  let undeliveredCount = 0;
  if (ordersData && ordersData.getOrders) {
    ordersData.getOrders.forEach(order => {
      if (Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          if (
            item.seller === authUser._id &&
            (!item.isDelivered || item.isDelivered === false)
          ) {
            undeliveredCount += item.qty || 1;
          }
        });
      }
    });
  }

  return (
    <div className="seller-page-main">
      <div className="seller-page-topbar">
        <button onClick={() => navigate("/")} className="seller-back-btn">
          Back to Home
        </button>
        <button
          onClick={() => navigate(`/seller/orders`)}
          className="seller-orders-btn"
        >
          <FiPackage size={20} style={{ marginRight: 6, verticalAlign: "middle" }} />
          View Sold Items
          {undeliveredCount > 0 && (
            <span className="seller-orders-badge">
              {undeliveredCount}
            </span>
          )}
        </button>
      </div>

      <h1>Seller Dashboard</h1>
      <p>Welcome, {authUser.username}! Manage your products below.</p>
      <button className="seller-add-btn" onClick={() => navigate("/seller/add")}>
        Add Product
      </button>

      {loading && <p>Loading...</p>}
      {error && <p className="seller-error">{error.message}</p>}

      <ul className="seller-products-list">
        {data && data.getProducts.filter(prod => prod.seller === authUser._id).map(product => (
          <li key={product._id} className="seller-product-card">
            <strong>Name:</strong> {product.name}<br />
            <strong>Description:</strong>
            <div style={{ whiteSpace: 'pre-line', marginBottom: 8 }}>
              {product.description}
            </div>
            <strong>Price:</strong> ${product.price}<br />
            <strong>Stock:</strong> {product.countInStock}<br />
            {product.image && <img src={product.image} alt="Product" width={120} />}<br />
            {product.images && product.images.length > 0 && (
              <div>
                <span>More Images:</span>
                <div className="seller-images-row">
                  {product.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`More ${idx}`} width={40} />
                  ))}
                </div>
              </div>
            )}
            {product.videos && product.videos.length > 0 && (
              <div>
                <span>Videos:</span>
                <div className="seller-videos-row">
                  {product.videos.map((vid, idx) => (
                    <video key={idx} src={vid} width={60} controls />
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() =>
                navigate(`/seller/edit/${product._id}`, {
                  state: {
                    scrollY: window.scrollY,
                    productId: product._id
                  }
                })
              }
              className="seller-edit-btn"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(product._id)}
              className="seller-delete-btn"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
