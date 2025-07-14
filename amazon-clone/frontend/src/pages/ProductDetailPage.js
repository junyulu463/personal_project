import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRODUCT, ADD_PRODUCT_REVIEW } from "../graphql/productQueries";
import { ADD_TO_CART, ADD_PRODUCT_VIEW } from "../graphql/userQueries";
import { useAuth } from "../context/AuthContext";
import '../styles/ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { authUser } = useAuth();
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery(GET_PRODUCT, {
    variables: { id },
    fetchPolicy: "network-only",
  });

  const [addToCart] = useMutation(ADD_TO_CART, { refetchQueries: ["GET_USERS"] });
  const [addProductView] = useMutation(ADD_PRODUCT_VIEW);
  const [addProductReview] = useMutation(ADD_PRODUCT_REVIEW);

  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [reviewMessage, setReviewMessage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [mainImage, setMainImage] = useState("");

  const product = data?.getProduct;

  useEffect(() => {
    if (product?.image) setMainImage(product.image);
  }, [product?.image]);

  useEffect(() => {
    if (authUser && id) {
      addProductView({ variables: { userId: authUser._id, productId: id } });
    }
  }, [authUser, id, addProductView]);

  if (loading) return <div className="productdetail-loading">Loading...</div>;
  if (error) return <div className="productdetail-error">Error: {error.message}</div>;
  if (!product) return <div className="productdetail-error">Product not found.</div>;

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

  // Main + gallery, no dups
  const galleryImages = [product.image, ...(product.images || []).filter(img => img !== product.image)];

  return (
    <div className="productdetail-container">
      <button
        className="productdetail-back"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <div className="productdetail-main">
        {/* Left: Image and gallery */}
        <div className="productdetail-gallery">
          <img
            src={mainImage}
            alt={product.name}
            className="productdetail-mainimg"
          />
          <div className="productdetail-thumbs">
            {galleryImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                className={`productdetail-thumbimg${mainImage === img ? ' active' : ''}`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
          {product.videos && product.videos.length > 0 && (
            <div className="productdetail-videos">
              <div className="productdetail-videolabel">Videos:</div>
              {product.videos.map((v, i) => (
                <video
                  key={i}
                  src={v}
                  width={180}
                  height={110}
                  controls
                  className="productdetail-video"
                />
              ))}
            </div>
          )}
        </div>
        {/* Right: Product info */}
        <div className="productdetail-info">
          <h1 className="productdetail-title">{product.name}</h1>
          <div className="productdetail-attrs">
            <div><strong>Price:</strong> ${product.price}</div>
            <div><strong>Brand:</strong> {product.brand}</div>
            <div><strong>Category:</strong> {product.category}</div>
            <div><strong>Stock:</strong> {product.countInStock > 0 ? product.countInStock : <span className="productdetail-outofstock">Out of stock</span>}</div>
            <div>
              <strong>Average Rating:</strong> {product.rating?.toFixed(2) || 0} ({product.numReviews} review{product.numReviews !== 1 && "s"})
            </div>
          </div>
          <p className="productdetail-desc">{product.description}</p>
          <div className="productdetail-purchase">
            <label>
              <strong>Quantity:</strong>{" "}
              <input
                type="number"
                min="1"
                max={product.countInStock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={product.countInStock === 0}
              />
            </label>
            <button
              className="productdetail-cartbtn"
              onClick={handleAddToCart}
              disabled={product.countInStock === 0 || addingToCart}
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>
            <button
              className="productdetail-gotocart"
              onClick={() => navigate("/cart")}
            >
              🛒 Go to Cart
            </button>
          </div>
        </div>
      </div>
      {/* Reviews */}
      <h2 className="productdetail-reviewsheader">Reviews</h2>
      {product.reviews.length === 0 && <div>No reviews yet.</div>}
      <ul className="productdetail-reviewslist">
        {product.reviews
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((r) => (
            <li key={r._id} className="productdetail-reviewitem">
              <div>
                <strong>{r.name}</strong>{" "}
                <span className="productdetail-stars">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </span>
              </div>
              <div className="productdetail-reviewdate">
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
        <form className="productdetail-reviewform" onSubmit={handleAddReview}>
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
          <div>
            <textarea
              name="comment"
              value={review.comment}
              onChange={handleReviewChange}
              placeholder="Write your review here..."
              rows={3}
              required
            />
          </div>
          <button type="submit" className="productdetail-submitreview">
            Submit Review
          </button>
          {reviewMessage && (
            <div className="productdetail-reviewmsg">
              {reviewMessage}
            </div>
          )}
        </form>
      )}
      {authUser && alreadyReviewed && (
        <div className="productdetail-alreadyreviewed">
          You have already reviewed this product.
        </div>
      )}
      {!authUser && (
        <div className="productdetail-loginmsg">
          Please log in to leave a review or add to cart.
        </div>
      )}
    </div>
  );
}
