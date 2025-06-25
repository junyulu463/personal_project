const opensearch = require('./opensearch');

async function indexProduct(product) {
  await opensearch.index({
    index: 'products',
    id: product._id.toString(),
    body: {
      name: product.name,
      description: product.description,
      image: product.image,
      images: product.images,
      videos: product.videos,
      price: product.price,
      countInStock: product.countInStock,
      category: product.category,
      brand: product.brand,
      rating: product.rating,
      numReviews: product.numReviews,
      seller: product.seller.toString(),
    }
  });
}

module.exports = { indexProduct };
