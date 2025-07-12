const { gql } = require('apollo-server-express');

const productTypeDef = gql`
  type Review {
    _id: ID!
    user: ID!           # User who left the review
    name: String!       # User's display name
    rating: Int!        # 1-5 star rating
    comment: String!    # Review text
    createdAt: String   # ISO date string
  }

  type Product {
    _id: ID!
    name: String!
    description: String!
    image: String!
    images: [String!]
    videos: [String!]
    price: Float!
    countInStock: Int!
    category: String!
    brand: String!
    reviews: [Review!]!   # <--- List of reviews
    rating: Float
    numReviews: Int
    seller: ID!           # Reference to User
  }

  type Query {
    getProducts: [Product]
    getProduct(id: ID!): Product
    searchProducts(query: String!, from: Int, size: Int): [Product]
    getProductsByIds(ids: [ID!]!): [Product]
  }

  type Mutation {
    addProduct(
      name: String!
      description: String!
      image: String!
      images: [String!]
      videos: [String!]
      price: Float!
      countInStock: Int!
      category: String!
      brand: String!
      seller: ID!
    ): Product

    updateProduct(
      id: ID!
      name: String
      description: String
      image: String
      images: [String!]
      videos: [String!]
      price: Float
      countInStock: Int
      category: String
      brand: String
      rating: Float
      numReviews: Int
      seller: ID
    ): Product

    deleteProduct(id: ID!): Product

    # Add or update a review for a product
    addProductReview(
      productId: ID!
      user: ID!
      name: String!
      rating: Int!
      comment: String!
    ): Product
  }
`;

module.exports = productTypeDef;
