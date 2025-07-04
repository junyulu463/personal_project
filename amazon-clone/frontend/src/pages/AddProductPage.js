import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { ADD_PRODUCT } from '../graphql/productQueries';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import ImageUpload from '../components/ImageUpload';

// S3 deletion mutation
const DELETE_S3_FILE = gql`
  mutation DeleteS3File($key: String!) {
    deleteS3File(key: $key)
  }
`;

const initialProduct = {
  name: "",
  description: "",
  image: "",
  images: [],
  videos: [],
  price: "",
  countInStock: "",
  category: "",
  brand: "",
};

export default function AddProductPage() {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const [addProduct] = useMutation(ADD_PRODUCT);
  const [deleteS3File] = useMutation(DELETE_S3_FILE);

  const [formProduct, setFormProduct] = useState(initialProduct);
  const [formError, setFormError] = useState('');
  const [uploadedInSession, setUploadedInSession] = useState([]);
  const [replacedMainImages, setReplacedMainImages] = useState([]);


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
  

  // Main image upload
  const handleMainImageUpload = (url) => {
    setFormProduct(prod => {
      if (prod.image && prod.image !== url) {
        setReplacedMainImages(list => [...list, prod.image]);
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

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await addProduct({
        variables: {
          ...formProduct,
          price: parseFloat(formProduct.price),
          countInStock: parseInt(formProduct.countInStock),
          seller: authUser._id,
        },
      });

      // Delete replaced main images
      for (const url of replacedMainImages) {
        const key = extractS3Key(url);
        if (key) await deleteS3File({ variables: { key } });
      }
      setReplacedMainImages([]);
      setUploadedInSession([]);
      setFormProduct(initialProduct);
      navigate('/seller', { state: { refresh: true } });
    } catch (err) {
      setFormError(err.message || "Error saving product");
    }
  };

  // Cancel (delete all uploaded in session + replaced main images)
  const handleCancel = async () => {
    for (const url of uploadedInSession) {
      const key = extractS3Key(url);
      if (key) await deleteS3File({ variables: { key } });
    }
    for (const url of replacedMainImages) {
      if (!uploadedInSession.includes(url)) {
        const key = extractS3Key(url);
        if (key) await deleteS3File({ variables: { key } });
      }
    }
    setUploadedInSession([]);
    setReplacedMainImages([]);
    setFormProduct(initialProduct);
    navigate('/seller', { state: { refresh: true } });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 500, border: '1px solid #ccc', padding: 16 }}>
        {/* Main image */}
        <div style={{ margin: '0.5rem 0' }}>
          <label>
            Main Image:
            <ImageUpload onUpload={handleMainImageUpload} />
            </label>
            {formProduct.image && (
              <div>
                <img src={formProduct.image} alt="Preview" width={120} style={{ display: "block", margin: "0.5rem 0" }} />
                <div style={{ wordBreak: 'break-all', fontSize: 12, color: '#555', marginTop: 4 }}>
                  <span>S3 URL:</span><br />
                  <a href={formProduct.image} target="_blank" rel="noopener noreferrer">{formProduct.image}</a>
                </div>
                <button
                  type="button"
                  style={{ color: 'red', fontSize: 10, marginTop: 4 }}
                  onClick={() => setFormProduct(prod => ({ ...prod, image: "" }))}
                >
                  Remove
                </button>
              </div>
            )}
        </div>
        {/* Additional images */}
        <div style={{ margin: '0.5rem 0' }}>
          <label>
            Additional Images:
            <ImageUpload onUpload={handleImagesUpload} accept="image/*" />
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            {formProduct.images.map((img, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <img src={img} alt={`Extra ${idx}`} width={60} />
                <div style={{ fontSize: 10, wordBreak: 'break-all' }}>
                  <a href={img} target="_blank" rel="noopener noreferrer">{img}</a>
                </div>
                <button type="button" onClick={() =>
                  setFormProduct(prod => ({
                    ...prod,
                    images: prod.images.filter((_, i) => i !== idx)
                  }))
                } style={{ color: 'red', fontSize: 10 }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
        {/* Videos */}
        <div style={{ margin: '0.5rem 0' }}>
          <label>
            Product Videos:
            <ImageUpload onUpload={handleVideosUpload} accept="video/*" />
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            {formProduct.videos.map((vid, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <video src={vid} width={80} controls style={{ display: 'block', marginBottom: 4 }} />
                <div style={{ fontSize: 10, wordBreak: 'break-all' }}>
                  <a href={vid} target="_blank" rel="noopener noreferrer">{vid}</a>
                </div>
                <button type="button" onClick={() =>
                  setFormProduct(prod => ({
                    ...prod,
                    videos: prod.videos.filter((_, i) => i !== idx)
                  }))
                } style={{ color: 'red', fontSize: 10 }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
        {/* Text fields */}
        {Object.entries(initialProduct).map(([key, _]) =>
          (["image", "images", "videos"].includes(key) ? null : (
            <div key={key} style={{ margin: '0.5rem 0' }}>
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
        <button type="submit">Add Product</button>
        <button type="button" onClick={handleCancel} style={{ marginLeft: 12 }}>Cancel</button>
      </form>
      {formError && <div style={{ color: 'red' }}>{formError}</div>}
    </div>
  );
}
