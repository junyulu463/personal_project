const { gql } = require('apollo-server-express');

const userTypeDef = gql`
type CartItem {
  _id: ID!           # <-- Add this for subdoc identification
  product: ID!
  quantity: Int!
}

type OrderRef {
  _id: ID!           # <-- Add this for subdoc identification
  order: ID!
  timestamp: String
}

type SearchHistoryEntry {
  _id: ID!           # <-- Add this for subdoc identification
  query: String!
  timestamp: String
}

type ProductViewEntry {
  _id: ID!           # <-- Add this for subdoc identification
  product: ID!
  timestamp: String
}

type User {
  _id: ID!
  username: String!
  password: String!
  email: String!
  name: String
  address: String
  phone: String
  role: String!
  cart: [CartItem]
  orderHistory: [OrderRef]
  unpaidOrders: [OrderRef]
  searchHistory: [SearchHistoryEntry]
  productViewHistory: [ProductViewEntry]
}

type Query {
  getUsers: [User]
  getUser(id: ID!): User
}

type Mutation {
  addUser(
    username: String!
    password: String!
    email: String!
    name: String
    address: String
    phone: String
    role: String
  ): User

  updateUser(
    id: ID!
    username: String
    password: String
    email: String
    name: String
    address: String
    phone: String
    role: String
  ): User

  deleteUser(id: ID!): User

  # Cart operations
  addToCart(
    userId: ID!
    productId: ID!
    quantity: Int
  ): User

  updateCartQuantity(userId: ID!, productId: ID!, quantity: Int!): User

  removeFromCart(
    userId: ID!
    productId: ID!
  ): User

  clearCart(userId: ID!): User

  # ---- NEW MUTATIONS FOR USER HISTORY ----

  # Order History
  addOrderToHistory(userId: ID!, orderId: ID!): User

  # Unpaid Orders
  addUnpaidOrder(userId: ID!, orderId: ID!): User
  removeUnpaidOrder(userId: ID!, orderId: ID!): User

  # Search History
  addSearchHistory(userId: ID!, query: String!): User
  clearSearchHistory(userId: ID!): User
  removeSearchHistoryEntry(userId: ID!, entryId: ID!): User    # <-- Use entryId

  # Product View History
  addProductView(userId: ID!, productId: ID!): User
  clearProductViewHistory(userId: ID!): User
  removeProductViewEntry(userId: ID!, entryId: ID!): User      # <-- Use entryId
}
`;

module.exports = userTypeDef;
