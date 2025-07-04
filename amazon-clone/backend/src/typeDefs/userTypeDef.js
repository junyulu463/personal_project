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

# --- NEW: Address & PaymentMethod Types ---

type Address {
  _id: ID!
  label: String          # e.g., "Home", "Work", "Dorm"
  recipient: String      # Optional: name of recipient
  address: String!
  city: String!
  postalCode: String!
  country: String!
  isDefault: Boolean!
  isBilling: Boolean      # If you want to support address for billing
}

type PaymentMethod {
  _id: ID!
  cardType: String!      # Visa, MasterCard, etc
  cardNumber: String!    # (store securely in production)
  nameOnCard: String!
  expiryMonth: Int!
  expiryYear: Int!
  cvv: String            # Only store if you must, and secure it!
  isDefault: Boolean!
  billingAddress: Address
}

type User {
  _id: ID!
  username: String!
  password: String!
  email: String!
  name: String
  phone: String
  role: String!
    # --- REMOVE old address field and add new ---
  addresses: [Address]           # NEW: All addresses (shipping/billing)
  defaultShippingAddress: Address
  defaultBillingAddress: Address

  paymentMethods: [PaymentMethod] # NEW: All payment methods
  defaultPaymentMethod: PaymentMethod
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
    phone: String
    role: String
    addresses: [AddressInput]
    paymentMethods: [PaymentMethodInput]
  ): User

  updateUser(
    id: ID!
    username: String
    password: String
    email: String
    name: String
    phone: String
    role: String
    addresses: [AddressInput]
    paymentMethods: [PaymentMethodInput]
    defaultShippingAddressId: ID
    defaultBillingAddressId: ID
    defaultPaymentMethodId: ID
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

  removeManyFromCart(
    userId: ID!
    productIds: [ID!]!
  ): User

  # ---- NEW MUTATIONS FOR USER HISTORY ----
  # Address operations
  addAddress(userId: ID!, address: AddressInput!): User
  updateAddress(userId: ID!, addressId: ID!, address: AddressInput!): User
  deleteAddress(userId: ID!, addressId: ID!): User
  setDefaultShippingAddress(userId: ID!, addressId: ID!): User
  setDefaultBillingAddress(userId: ID!, addressId: ID!): User

  # Payment Method operations
  addPaymentMethod(userId: ID!, paymentMethod: PaymentMethodInput!): User
  updatePaymentMethod(userId: ID!, paymentMethodId: ID!, paymentMethod: PaymentMethodInput!): User
  deletePaymentMethod(userId: ID!, paymentMethodId: ID!): User
  setDefaultPaymentMethod(userId: ID!, paymentMethodId: ID!): User


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

input AddressInput {
  label: String
  recipient: String
  address: String!
  city: String!
  postalCode: String!
  country: String!
  isDefault: Boolean
  isBilling: Boolean
}

input PaymentMethodInput {
  cardType: String!
  cardNumber: String!
  nameOnCard: String!
  expiryMonth: Int!
  expiryYear: Int!
  cvv: String
  isDefault: Boolean
  billingAddress: AddressInput
}
`;



module.exports = userTypeDef;
