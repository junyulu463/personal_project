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
  label: String       
  recipient: String     
  address: String!
  city: String!
  postalCode: String!
  country: String!
  isDefault: Boolean!
}

type PaymentMethod {
  _id: ID!
  cardType: String!    
  cardNumber: String!   
  cardholderName: String! 
  expMonth: Int!           
  expYear: Int!            
  cvv: String            
  billingAddress: Address
  isDefault: Boolean!
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

  # Addresses
  shippingAddresses: [Address]
  defaultShippingAddressId: ID
  billingAddresses: [Address]
  defaultBillingAddressId: ID
  paymentMethods: [PaymentMethod] # NEW: All payment methods
  defaultPaymentMethodId: ID
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
    shippingAddresses: [AddressInput]
    billingAddresses: [AddressInput]
    paymentMethods: [PaymentMethodInput]
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
    shippingAddresses: [AddressInput]
    billingAddresses: [AddressInput]
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
  # Shipping Address operations
  addShippingAddress(userId: ID!, address: AddressInput!): User
  updateShippingAddress(userId: ID!, addressId: ID!, address: AddressInput!): User
  deleteShippingAddress(userId: ID!, addressId: ID!): User
  setDefaultShippingAddress(userId: ID!, addressId: ID!): User

  # Billing Address operations
  addBillingAddress(userId: ID!, address: AddressInput!): User
  updateBillingAddress(userId: ID!, addressId: ID!, address: AddressInput!): User
  deleteBillingAddress(userId: ID!, addressId: ID!): User
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
}

input PaymentMethodInput {
  cardType: String!
  cardNumber: String!
  cardholderName: String!   # <-- changed from nameOnCard
  expMonth: Int!            # <-- changed from expiryMonth
  expYear: Int!             # <-- changed from expiryYear
  cvv: String
  billingAddress: AddressInput
  isDefault: Boolean
}
`;



module.exports = userTypeDef;
