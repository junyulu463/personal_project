import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { GET_PRODUCTS, DELETE_PRODUCT } from '../graphql/productQueries';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

// S3 deletion mutation
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

  React.useEffect(() => {
    if (location.state?.refresh) {
      setPendingScroll(location.state.scrollY || 0);
      refetch();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);
  React.useEffect(() => {
    if (pendingScroll !== null && data?.getProducts?.length > 0) {
      // Wait until DOM renders before scrolling
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
      const { pathname } = new URL(url);       // safer than regex
      const key = decodeURIComponent(pathname.slice(1)); // remove the leading "/"
      console.log("Extracted S3 key:", key);   // ✅ helpful log
      return key;
    } catch (err) {
      console.error("Invalid URL for S3 key extraction:", url);
      return null;
    }
  };
  

  // Delete product and associated media from S3
  const handleDelete = async (id) => {
    try {
      // Find product to delete its images/videos from S3
    // Always refetch latest data before deleting
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
            } catch (err) {
              console.warn('Failed to delete S3 file:', url, err.message);
            }
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
      <div style={{ padding: "2rem" }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate("/")} style={{ marginBottom: 20 }}>
        Back to Home
      </button>
      <button
        onClick={() => navigate(`/seller/orders`)}
        style={{ marginLeft: 12, background: "#f5f5f5", border: "1px solid #ccc", borderRadius: 5, padding: "6px 18px", fontWeight: 500 }}
      >
        View Sold Items
      </button>      
      <h1>Seller Dashboard</h1>
      <p>Welcome, {authUser.username}! Manage your products below.</p>
      <button onClick={() => navigate("/seller/add")}>
        Add Product
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error.message}</p>}

      <ul>
        {data && data.getProducts.filter(prod => prod.seller === authUser._id).map(product => (
          <li key={product._id} style={{ marginBottom: '1.5rem', border: '1px solid #eee', padding: '1rem', borderRadius: 6 }}>
            <strong>Name:</strong> {product.name}<br />
            <strong>Description:</strong>
            <div style={{ whiteSpace: 'pre-line', marginBottom: 8 }}>
              {product.description}
            </div>

            <strong>Price:</strong> ${product.price}<br />
            <strong>Stock:</strong> {product.countInStock}<br />
            {product.image && <img src={product.image} alt="Product" width={120} />}<br />
            {/* List additional images */}
            {product.images && product.images.length > 0 && (
              <div>
                <span>More Images:</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {product.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`More ${idx}`} width={40} />
                  ))}
                </div>
              </div>
            )}
            {/* List videos */}
            {product.videos && product.videos.length > 0 && (
              <div>
                <span>Videos:</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {product.videos.map((vid, idx) => (
                    <video key={idx} src={vid} width={60} controls />
                  ))}
                </div>
              </div>
            )}
            {/* <button onClick={() => navigate(`/seller/edit/${product._id}`)} style={{ marginRight: 8 }}>Edit</button> */}
            <button
              onClick={() =>
                navigate(`/seller/edit/${product._id}`, {
                  state: {
                    scrollY: window.scrollY,
                    productId: product._id
                  }
                })
              }
              style={{ marginRight: 8 }}
            >
              Edit
            </button>           
            <button onClick={() => handleDelete(product._id)} style={{ color: 'red' }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
