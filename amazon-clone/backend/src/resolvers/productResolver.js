const Product = require('../models/Product');
const { indexProduct } = require('../config/productSearchService');
const opensearch = require('../config/opensearch');

const productResolver = {
  Query: {
    getRandomProducts: async (_, { size }) => {
      // Use aggregation $sample for random selection
      return Product.aggregate([{ $sample: { size } }]);
    },
    getProducts: async () => await Product.find(),
    getProduct: async (_, { id }) => await Product.findById(id),
    getProductsByIds: async (_, { ids }) => {
      // ids: array of strings
      return await Product.find({ _id: { $in: ids } });
    },    
    searchProducts: async (_, { query, from = 0, size = 20 }) => {
      const { body } = await opensearch.search({
        index: 'products',
        from, // skip N items
        size, // how many to fetch
        body: {
          query: {
            multi_match: {
              query,
              fields: ['name', 'description', 'brand', 'category'],
              fuzziness: 'AUTO'
            }
          }
        }
      });
      return body.hits.hits.map(hit => ({
        _id: hit._id,
        ...hit._source
      }));
    }    
  },

  Mutation: {
    addProduct: async (_, args) => {
      const product = new Product({
        name: args.name,
        description: args.description,
        image: args.image,
        images: args.images || [],
        videos: args.videos || [],
        price: args.price,
        countInStock: args.countInStock,
        category: args.category,
        brand: args.brand,
        seller: args.seller,
        reviews: [],
      });
      await product.save();
      await indexProduct(product); // Index in OpenSearch!
      return product;
    },

    updateProduct: async (_, args) => {
      const { id, ...fieldsToUpdate } = args;
      const product = await Product.findByIdAndUpdate(
        id,
        { $set: fieldsToUpdate },
        { new: true }
      );
      if (product) {
        await indexProduct(product); // Re-index in OpenSearch!
      }
      return product;
    },

    deleteProduct: async (_, { id }) => {
      // 1. Remove from MongoDB
      const product = await Product.findByIdAndDelete(id);
      if (product) {
        // 2. Remove from OpenSearch
        await opensearch.delete({
          index: 'products',
          id: id,
        });
      }
      return product;
    },
    

    addProductReview: async (_, { productId, user, name, rating, comment }) => {
      const product = await Product.findById(productId);
      if (!product) throw new Error("Product not found");

      const alreadyReviewed = product.reviews.some(
        (r) => r.user.toString() === user
      );
      if (alreadyReviewed) throw new Error("Product already reviewed by this user.");

      const review = {
        user,
        name,
        rating,
        comment,
        createdAt: new Date(),
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, cur) => acc + cur.rating, 0) /
        product.reviews.length;

      await product.save();
      await indexProduct(product); // Optionally update in OpenSearch too!
      return product;
    },
  },
};

module.exports = productResolver;
