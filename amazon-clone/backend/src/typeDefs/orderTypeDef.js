const { gql } = require('apollo-server-express');

const orderTypeDef = gql`
  type OrderItem {
    product: ID!
    name: String!
    qty: Int!
    price: Float!
    image: String!
    seller: ID!                    # NEW: Which seller owns this item
    isDelivered: Boolean!          # NEW: Per-item delivery status
    deliveredAt: String            # NEW: Per-item delivery time
  }

  type ShippingAddress {
    address: String!
    city: String!
    postalCode: String!
    country: String!
    recipient: String              # Optional, in case shipped to other name
    label: String                  # "Home", "Work", etc
  }

  type BillingAddress {
    address: String!
    city: String!
    postalCode: String!
    country: String!
    recipient: String
    label: String
  }

  type PaymentMethodSnapshot {     # For order history, a snapshot of payment details at time of order
    cardType: String!
    cardNumber: String!           # In production, only last 4, but here as per your spec
    cardholderName: String!
    expMonth: Int!
    expYear: Int!
  }

  type PaymentResult {
    id: String
    status: String
    update_time: String
    email_address: String
  }

  type Order {
    _id: ID!
    user: ID!
    orderItems: [OrderItem!]!
    shippingAddress: ShippingAddress!
    billingAddress: BillingAddress     # NEW: Billing address for this order
    paymentMethod: PaymentMethodSnapshot!   # NEW: Card info at time of order
    paymentResult: PaymentResult
    itemsPrice: Float!
    shippingPrice: Float!
    taxPrice: Float!
    totalPrice: Float!
    isPaid: Boolean!
    paidAt: String
    createdAt: String
    updatedAt: String
    isDelivered: Boolean!
    deliveredAt: String
  }

  type Query {
    getOrders: [Order]
    getOrder(id: ID!): Order
    getOrdersByIds(ids: [ID!]!): [Order!]!
  }
    

  type Mutation {
    cancelOrder(orderId: ID!, productId: ID): Order
    
    addOrder(
      user: ID!
      orderItems: [OrderItemInput!]!
      shippingAddress: ShippingAddressInput!
      billingAddress: BillingAddressInput      # NEW
      paymentMethod: PaymentMethodSnapshotInput! # NEW
      paymentResult: PaymentResultInput
      itemsPrice: Float!
      shippingPrice: Float!
      taxPrice: Float!
      totalPrice: Float!
      isPaid: Boolean
      paidAt: String
      isDelivered: Boolean
      deliveredAt: String
    ): Order

    updateOrder(
      id: ID!
      isPaid: Boolean
      paidAt: String
      isDelivered: Boolean
      deliveredAt: String
      paymentResult: PaymentResultInput
      orderItems: [OrderItemUpdateInput]
      shippingAddress: ShippingAddressInput       
      billingAddress: BillingAddressInput         # NEW
      paymentMethod: PaymentMethodSnapshotInput   # NEW
      itemsPrice: Float                           # NEW
      shippingPrice: Float                        # NEW
      taxPrice: Float                             # NEW
      totalPrice: Float                           # NEW
    ): Order

    deleteOrder(id: ID!): Order
  }

  input OrderItemInput {
    product: ID!
    name: String!
    qty: Int!
    price: Float!
    image: String!
    seller: ID!                 # NEW
  }

  input OrderItemUpdateInput {  # For updating item delivery status
    product: ID!
    isDelivered: Boolean
    deliveredAt: String
  }

  input ShippingAddressInput {
    address: String!
    city: String!
    postalCode: String!
    country: String!
    recipient: String
    label: String
  }

  input BillingAddressInput {
    address: String!
    city: String!
    postalCode: String!
    country: String!
    recipient: String
    label: String
  }


  input PaymentMethodSnapshotInput {
    cardType: String!
    cardNumber: String!
    cardholderName: String!
    expMonth: Int!
    expYear: Int!
  }

  input PaymentResultInput {
    id: String
    status: String
    update_time: String
    email_address: String
  }
`;

module.exports = orderTypeDef;
