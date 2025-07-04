import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { GET_PRODUCTS, UPDATE_PRODUCT } from '../graphql/productQueries';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from "react-router-dom";
import ImageUpload from '../components/ImageUpload';
import { useLocation } from 'react-router-dom';

// S3 deletion mutation
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

  // useEffect(() => {
  //   if (data) {
  //     const product = data.getProducts.find(prod => prod._id === id);
  //     if (product) {
  //       setFormProduct({ ...product });
  //       setOriginalMedia({
  //         image: product.image,
  //         images: product.images || [],
  //         videos: product.videos || [],
  //       });
  //     }
  //   }
  // }, [data, id]);

  useEffect(() => {
    if (data) {
      const product = data.getProducts.find(prod => prod._id === id);
      if (product) {
        // Strip __typename
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
  

  // const extractS3Key = (url) => {
  //   const match = url.match(/\.amazonaws\.com\/(.+)$/);
  //   return match ? match[1] : null;
  // };
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
      // for (const url of toDeleteVideos) {
      //   const key = extractS3Key(url);
      //   if (key) await deleteS3File({ variables: { key } });
      // }
      for (const url of toDeleteVideos) {
        const key = extractS3Key(url);
        if (key) {
          try {
            await deleteS3File({ variables: { key } });
            console.log("Deleted video from S3:", key);
          } catch (err) {
            console.error("Failed to delete video:", key, err.message);
          }
        }
      }
      

      // ✅ Additional cleanup for any leftover uploaded files
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
      
        // If not used and not already deleted, delete now
        if (!stillUsed && !allDeletions.has(url)) {
          const key = extractS3Key(url);
          if (key) await deleteS3File({ variables: { key } });
        }
      }
      

      setToDeleteMainImages([]);
      setToDeleteImages([]);
      setToDeleteVideos([]);
      setUploadedInSession([]);
      // In EditProductPage.js, after a successful update:
      // navigate('/seller', { state: { refresh: true } });
      navigate('/seller', {
        state: {
          refresh: true,
          scrollY: location.state?.scrollY || 0, // <- preserve scroll position
          productId: id // optional: if you want to scroll to a specific product later
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
    // navigate('/seller', { state: { refresh: true } });
    navigate('/seller', {
      state: {
        refresh: true,
        scrollY: location.state?.scrollY || 0,  // 👈 carry over previous scroll position
        productId: id // optional, useful if you're targeting the product
      }
    });
    
  };

  if (loading || !formProduct) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Edit Product</h2>
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
                  onClick={removeMainImage}
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
                <button type="button" onClick={() => removeFromArray('images', idx)} style={{ color: 'red', fontSize: 10 }}>Remove</button>
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
                <button type="button" onClick={() => removeFromArray('videos', idx)} style={{ color: 'red', fontSize: 10 }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
        {/* Text fields */}
        {formProduct && Object.entries(formProduct).map(([key, value]) =>
          (["image", "images", "videos", "_id", "seller"].includes(key) ? null : (
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
        <button type="submit">Update Product</button>
        <button type="button" onClick={handleCancel} style={{ marginLeft: 12 }}>Cancel</button>
      </form>
      {formError && <div style={{ color: 'red' }}>{formError}</div>}
    </div>
  );
}
