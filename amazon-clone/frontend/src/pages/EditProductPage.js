import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { GET_PRODUCTS, UPDATE_PRODUCT } from '../graphql/productQueries';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from "react-router-dom";
import ImageUpload from '../components/ImageUpload';
import { useLocation } from 'react-router-dom';
import '../styles/EditProductPage.css'; // Import your CSS

const DELETE_S3_FILE = gql`
  mutation DeleteS3File($key: String!) {
    deleteS3File(key: $key)
  }
`;

export default function EditProductPage() {
  const location = useLocation();
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { loading, data } = useQuery(GET_PRODUCTS);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteS3File] = useMutation(DELETE_S3_FILE);

  const [formProduct, setFormProduct] = useState(null);
  const [formError, setFormError] = useState('');
  const [uploadedInSession, setUploadedInSession] = useState([]);
  const [toDeleteMainImages, setToDeleteMainImages] = useState([]);
  const [toDeleteImages, setToDeleteImages] = useState([]);
  const [toDeleteVideos, setToDeleteVideos] = useState([]);
  const [originalMedia, setOriginalMedia] = useState({ image: "", images: [], videos: [] });

  useEffect(() => {
    if (data) {
      const product = data.getProducts.find(prod => prod._id === id);
      if (product) {
        const { __typename, ...cleanProduct } = product;
        setFormProduct({ ...cleanProduct });
        setOriginalMedia({
          image: product.image,
          images: product.images || [],
          videos: product.videos || [],
        });
      }
    }
  }, [data, id]);

  const extractS3Key = (url) => {
    try {
      const { pathname } = new URL(url);
      return decodeURIComponent(pathname.slice(1));
    } catch {
      return null;
    }
  };

  const handleMainImageUpload = (url) => {
    setFormProduct(prod => {
      if (prod.image && prod.image !== url) {
        setToDeleteMainImages(prev =>
          prev.includes(prod.image) ? prev : [...prev, prod.image]
        );
      }
      return { ...prod, image: url };
    });
    setUploadedInSession(list => [...list, url]);
  };
  const handleImagesUpload = (url) => {
    setFormProduct(prod => ({ ...prod, images: [...prod.images, url] }));
    setUploadedInSession(list => [...list, url]);
  };
  const handleVideosUpload = (url) => {
    setFormProduct(prod => ({ ...prod, videos: [...prod.videos, url] }));
    setUploadedInSession(list => [...list, url]);
  };

  const removeFromArray = (arrayName, idx) => {
    const url = formProduct[arrayName][idx];
    if (arrayName === 'images') setToDeleteImages(list => [...list, url]);
    if (arrayName === 'videos') setToDeleteVideos(list => [...list, url]);
    setFormProduct(prod => ({
      ...prod,
      [arrayName]: prod[arrayName].filter((_, i) => i !== idx)
    }));
  };

  const removeMainImage = () => {
    if (formProduct.image) {
      setToDeleteMainImages(prev =>
        prev.includes(formProduct.image) ? prev : [...prev, formProduct.image]
      );
    }
    setFormProduct(prod => ({ ...prod, image: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await updateProduct({
        variables: {
          id,
          ...formProduct,
          price: parseFloat(formProduct.price),
          countInStock: parseInt(formProduct.countInStock),
          seller: authUser._id,
        },
      });

      for (const url of toDeleteMainImages) {
        const key = extractS3Key(url);
        if (key) await deleteS3File({ variables: { key } });
      }
      for (const url of toDeleteImages) {
        const key = extractS3Key(url);
        if (key) await deleteS3File({ variables: { key } });
      }
      for (const url of toDeleteVideos) {
        const key = extractS3Key(url);
        if (key) {
          try {
            await deleteS3File({ variables: { key } });
          } catch {}
        }
      }

      const allDeletions = new Set([
        ...toDeleteMainImages,
        ...toDeleteImages,
        ...toDeleteVideos,
      ]);

      for (const url of uploadedInSession) {
        const stillUsed =
          url === formProduct.image ||
          (formProduct.images && formProduct.images.includes(url)) ||
          (formProduct.videos && formProduct.videos.includes(url));
        if (!stillUsed && !allDeletions.has(url)) {
          const key = extractS3Key(url);
          if (key) await deleteS3File({ variables: { key } });
        }
      }

      setToDeleteMainImages([]);
      setToDeleteImages([]);
      setToDeleteVideos([]);
      setUploadedInSession([]);

      navigate('/seller', {
        state: {
          refresh: true,
          scrollY: location.state?.scrollY || 0,
          productId: id
        }
      });
    } catch (err) {
      setFormError(err.message || "Error saving product");
    }
  };

  const handleCancel = async () => {
    for (const url of uploadedInSession) {
      const inOriginal =
        url === (originalMedia.image || "") ||
        (originalMedia.images && originalMedia.images.includes(url)) ||
        (originalMedia.videos && originalMedia.videos.includes(url));
      if (!inOriginal) {
        const key = extractS3Key(url);
        if (key) await deleteS3File({ variables: { key } });
      }
    }
    for (const url of toDeleteMainImages) {
      const key = extractS3Key(url);
      if (key) await deleteS3File({ variables: { key } });
    }
    setUploadedInSession([]);
    setToDeleteMainImages([]);
    setToDeleteImages([]);
    setToDeleteVideos([]);
    setFormProduct(null);
    navigate('/seller', {
      state: {
        refresh: true,
        scrollY: location.state?.scrollY || 0,
        productId: id
      }
    });
  };

  if (loading || !formProduct) return <div>Loading...</div>;

  return (
    <div className="edit-product-container">
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit} className="edit-product-form">
        {/* Main image */}
        <div className="edit-product-section">
          <label>
            Main Image:
            <ImageUpload onUpload={handleMainImageUpload} />
          </label>
          {formProduct.image && (
            <div className="edit-product-preview">
              <img src={formProduct.image} alt="Preview" width={120} />
              <div className="edit-product-url">
                <span>S3 URL:</span><br />
                <a href={formProduct.image} target="_blank" rel="noopener noreferrer">{formProduct.image}</a>
              </div>
              <button
                type="button"
                className="edit-product-remove-btn"
                onClick={removeMainImage}
              >
                Remove
              </button>
            </div>
          )}
        </div>
        {/* Additional images */}
        <div className="edit-product-section">
          <label>
            Additional Images:
            <ImageUpload onUpload={handleImagesUpload} accept="image/*" />
          </label>
          <div className="edit-product-row">
            {formProduct.images.map((img, idx) => (
              <div key={idx} className="edit-product-thumb">
                <img src={img} alt={`Extra ${idx}`} width={60} />
                <div className="edit-product-url">
                  <a href={img} target="_blank" rel="noopener noreferrer">{img}</a>
                </div>
                <button
                  type="button"
                  className="edit-product-remove-btn"
                  onClick={() => removeFromArray('images', idx)}
                >Remove</button>
              </div>
            ))}
          </div>
        </div>
        {/* Videos */}
        <div className="edit-product-section">
          <label>
            Product Videos:
            <ImageUpload onUpload={handleVideosUpload} accept="video/*" />
          </label>
          <div className="edit-product-row">
            {formProduct.videos.map((vid, idx) => (
              <div key={idx} className="edit-product-thumb">
                <video src={vid} width={80} controls />
                <div className="edit-product-url">
                  <a href={vid} target="_blank" rel="noopener noreferrer">{vid}</a>
                </div>
                <button
                  type="button"
                  className="edit-product-remove-btn"
                  onClick={() => removeFromArray('videos', idx)}
                >Remove</button>
              </div>
            ))}
          </div>
        </div>
        {/* Text fields */}
        {formProduct && Object.entries(formProduct).map(([key]) =>
          (["image", "images", "videos", "_id", "seller"].includes(key) ? null : (
            <div className="edit-product-section" key={key}>
              <label>
                {key[0].toUpperCase() + key.slice(1)}:
                <input
                  type={key === "price" || key === "countInStock" ? "number" : "text"}
                  name={key}
                  value={formProduct[key]}
                  onChange={e =>
                    setFormProduct({ ...formProduct, [e.target.name]: e.target.value })
                  }
                  required={["name", "description", "image", "price", "countInStock", "category", "brand"].includes(key)}
                />
              </label>
            </div>
          ))
        )}
        <button type="submit" className="edit-product-submit-btn">Update Product</button>
        <button type="button" className="edit-product-cancel-btn" onClick={handleCancel}>Cancel</button>
      </form>
      {formError && <div className="edit-product-error">{formError}</div>}
    </div>
  );
}
