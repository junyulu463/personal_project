import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRODUCT, ADD_PRODUCT_REVIEW } from "../graphql/productQueries";
import { ADD_TO_CART, ADD_PRODUCT_VIEW } from "../graphql/userQueries";
import { useAuth } from "../context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { authUser } = useAuth();
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery(GET_PRODUCT, {
    variables: { id },
    fetchPolicy: "network-only",
  });

  const [addToCart] = useMutation(ADD_TO_CART, {
    refetchQueries: ["GET_USERS"],
  });
  const [addProductView] = useMutation(ADD_PRODUCT_VIEW);
  const [addProductReview] = useMutation(ADD_PRODUCT_REVIEW);

  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [reviewMessage, setReviewMessage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [mainImage, setMainImage] = useState("");

  // Product reference
  const product = data?.getProduct;

  // Set main image to primary when product loads
  useEffect(() => {
    if (product?.image) setMainImage(product.image);
  }, [product?.image]);

  // Record product view in history
  useEffect(() => {
    if (authUser && id) {
      addProductView({ variables: { userId: authUser._id, productId: id } });
    }
    // eslint-disable-next-line
  }, [authUser, id]);

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (error) return <div style={{ color: "red", padding: 32 }}>Error: {error.message}</div>;
  if (!product) return <div style={{ padding: 32 }}>Product not found.</div>;

  const handleAddToCart = async () => {
    if (!authUser) {
      alert("Please log in to add to cart.");
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart({
        variables: {
          userId: authUser._id,
          productId: product._id,
          quantity: parseInt(quantity, 10),
        },
      });
      setAddingToCart(false);
      alert("Added to cart!");
    } catch (err) {
      setAddingToCart(false);
      alert("Failed to add to cart: " + err.message);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!authUser) {
      setReviewMessage("Please log in to leave a review.");
      return;
    }
    try {
      await addProductReview({
        variables: {
          productId: product._id,
          user: authUser._id,
          name: authUser.username,
          rating: parseInt(review.rating, 10),
          comment: review.comment,
        },
      });
      setReview({ rating: 5, comment: "" });
      setReviewMessage("Review submitted!");
      refetch();
    } catch (err) {
      setReviewMessage(err.message || "Failed to submit review.");
    }
  };

  const alreadyReviewed = product.reviews.some(
    (r) => r.user === authUser?._id
  );

  // All images: main + gallery (no dups)
  const galleryImages = [product.image, ...(product.images || []).filter(img => img !== product.image)];

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 4,
          padding: "8px 16px",
          marginBottom: 24,
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        {/* Left: Image and gallery */}
        <div style={{ minWidth: 340, maxWidth: 360 }}>
          {/* Main Image */}
          <img
            src={mainImage}
            alt={product.name}
            width={320}
            height={320}
            style={{
              borderRadius: 8,
              objectFit: "contain",
              marginBottom: 12,
              background: "#f7f7f7",
              width: "320px",
              height: "320px"
            }}
          />
          {/* Thumbnails */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {galleryImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                width={60}
                height={60}
                style={{
                  objectFit: "cover",
                  borderRadius: 6,
                  border: mainImage === img ? "2px solid #1976d2" : "1px solid #eee",
                  cursor: "pointer",
                  background: "#fff",
                }}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
          {/* Videos */}
          {product.videos && product.videos.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Videos:</div>
              {product.videos.map((v, i) => (
                <video
                  key={i}
                  src={v}
                  width={180}
                  height={110}
                  controls
                  style={{ marginRight: 10, borderRadius: 6, border: "1px solid #eee" }}
                />
              ))}
            </div>
          )}
        </div>
        {/* Right: Product info */}
        <div style={{ flex: 1, minWidth: 320, maxWidth: 520 }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8, lineHeight: 1.1, wordBreak: "break-word" }}>
            {product.name}
          </h1>
          <div style={{ margin: "20px 0" }}>
            <div><strong>Price:</strong> ${product.price}</div>
            <div><strong>Brand:</strong> {product.brand}</div>
            <div><strong>Category:</strong> {product.category}</div>
            <div><strong>Stock:</strong> {product.countInStock > 0 ? product.countInStock : <span style={{ color: "red" }}>Out of stock</span>}</div>
            <div>
              <strong>Average Rating:</strong> {product.rating?.toFixed(2) || 0} ({product.numReviews} review{product.numReviews !== 1 && "s"})
            </div>
          </div>
          <p style={{ marginTop: 0 }}>{product.description}</p>
          <div style={{ margin: "20px 0" }}>
            <label>
              <strong>Quantity:</strong>{" "}
              <input
                type="number"
                min="1"
                max={product.countInStock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ width: 60, marginRight: 8 }}
                disabled={product.countInStock === 0}
              />
            </label>
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0 || addingToCart}
              style={{
                marginLeft: 16,
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "8px 24px",
                fontWeight: "bold",
                cursor: product.countInStock === 0 ? "not-allowed" : "pointer"
              }}
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>
          {/* 🛒 Go to Cart Button (added) */}
          <button
            onClick={() => navigate("/cart")}  // 🛒 <-- added
            style={{
              marginLeft: 16,   // <-- add this line
              marginBottom: 16,
              background: "#ffd700",
              color: "#222",
              border: "1px solid #e2b400",
              borderRadius: 4,
              padding: "8px 24px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            🛒 Go to Cart
          </button>            
          </div>
        </div>
      </div>
      {/* Reviews */}
      <h2 style={{ marginTop: 48 }}>Reviews</h2>
      {product.reviews.length === 0 && <div>No reviews yet.</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {product.reviews
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((r) => (
            <li key={r._id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
              <div>
                <strong>{r.name}</strong>{" "}
                <span style={{ color: "#ffa600" }}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </span>
              </div>
              <div style={{ color: "#777", fontSize: 13 }}>
                {r.createdAt && !isNaN(new Date(r.createdAt))
                  ? new Date(r.createdAt).toLocaleString()
                  : ""}
              </div>
              <div>{r.comment}</div>
            </li>
          ))}
      </ul>
      {/* Review Form */}
      {authUser && !alreadyReviewed && (
        <form onSubmit={handleAddReview} style={{ marginTop: 32 }}>
          <h3>Add Your Review</h3>
          <div>
            <label>
              Rating:{" "}
              <select
                name="rating"
                value={review.rating}
                onChange={handleReviewChange}
                required
              >
                {[5, 4, 3, 2, 1].map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ margin: "10px 0" }}>
            <textarea
              name="comment"
              value={review.comment}
              onChange={handleReviewChange}
              placeholder="Write your review here..."
              rows={3}
              style={{ width: "100%", borderRadius: 6, padding: 8 }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              background: "#43a047",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "8px 24px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Submit Review
          </button>
          {reviewMessage && (
            <div style={{ color: "#1976d2", marginTop: 10 }}>
              {reviewMessage}
            </div>
          )}
        </form>
      )}
      {authUser && alreadyReviewed && (
        <div style={{ marginTop: 20, color: "#43a047" }}>
          You have already reviewed this product.
        </div>
      )}
      {!authUser && (
        <div style={{ marginTop: 24, color: "#d9534f" }}>
          Please log in to leave a review or add to cart.
        </div>
      )}
    </div>
  );
}
