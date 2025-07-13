import { gql } from '@apollo/client';

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      _id
      name
      description
      image
      images
      videos
      price
      countInStock
      category
      brand
      rating
      numReviews
      seller
      reviews {
        _id
        user
        name
        rating
        comment
        createdAt
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query {
    getProducts {
      _id
      name
      description
      image
      images
      videos
      price
      countInStock
      category
      brand
      rating
      numReviews
      seller
      reviews {
        _id
        user
        name
        rating
        comment
        createdAt
      }
    }
  }
`;

export const GET_PRODUCTS_BY_IDS = gql`
  query GetProductsByIds($ids: [ID!]!) {
    getProductsByIds(ids: $ids) {
      _id
      name
      image
      price
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!, $from: Int, $size: Int) {
    searchProducts(query: $query, from: $from, size: $size) {
      _id
      name
      description
      image
      price
      brand
      category
    }
  }
`;


export const ADD_PRODUCT = gql`
  mutation AddProduct(
    $name: String!
    $description: String!
    $image: String!
    $images: [String!]
    $videos: [String!]
    $price: Float!
    $countInStock: Int!
    $category: String!
    $brand: String!
    $seller: ID!     
  ) {
    addProduct(
      name: $name
      description: $description
      image: $image
      images: $images
      videos: $videos
      price: $price
      countInStock: $countInStock
      category: $category
      brand: $brand
      seller: $seller    
    ) {
      _id
      name
      images
      videos
      seller
      reviews {
        _id
        user
        name
        rating
        comment
        createdAt
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $id: ID!
    $name: String
    $description: String
    $image: String
    $images: [String!]
    $videos: [String!]
    $price: Float
    $countInStock: Int
    $category: String
    $brand: String
    $seller: ID         
  ) {
    updateProduct(
      id: $id
      name: $name
      description: $description
      image: $image
      images: $images
      videos: $videos
      price: $price
      countInStock: $countInStock
      category: $category
      brand: $brand
      seller: $seller    
    ) {
      _id
      name
      images
      videos
      seller
      reviews {
        _id
        user
        name
        rating
        comment
        createdAt
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      _id
    }
  }
`;

// New: Add product review/comment
export const ADD_PRODUCT_REVIEW = gql`
  mutation AddProductReview(
    $productId: ID!
    $user: ID!
    $name: String!
    $rating: Int!
    $comment: String!
  ) {
    addProductReview(
      productId: $productId
      user: $user
      name: $name
      rating: $rating
      comment: $comment
    ) {
      _id
      reviews {
        _id
        user
        name
        rating
        comment
        createdAt
      }
      rating
      numReviews
    }
  }
`;

export const GET_RANDOM_PRODUCTS = gql`
  query GetRandomProducts($size: Int!) {
    getRandomProducts(size: $size) {
      _id
      name
      price
      image
    }
  }
`;
