const { gql } = require('apollo-server-express');

const orderTypeDef = gql`
  type OrderItem {
    product: ID!
    name: String!
    qty: Int!
    price: Float!
    image: String!
  }

  type ShippingAddress {
    address: String!
    city: String!
    postalCode: String!
    country: String!
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
    paymentMethod: String!
    paymentResult: PaymentResult
    itemsPrice: Float!
    shippingPrice: Float!
    taxPrice: Float!
    totalPrice: Float!
    isPaid: Boolean!
    paidAt: String
    isDelivered: Boolean!
    deliveredAt: String
    createdAt: String
    updatedAt: String
  }

  type Query {
    getOrders: [Order]
    getOrder(id: ID!): Order
  }

  type Mutation {
    addOrder(
      user: ID!
      orderItems: [OrderItemInput!]!
      shippingAddress: ShippingAddressInput!
      paymentMethod: String!
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
    ): Order

    deleteOrder(id: ID!): Order
  }

  input OrderItemInput {
    product: ID!
    name: String!
    qty: Int!
    price: Float!
    image: String!
  }

  input ShippingAddressInput {
    address: String!
    city: String!
    postalCode: String!
    country: String!
  }

  input PaymentResultInput {
    id: String
    status: String
    update_time: String
    email_address: String
  }
`;

module.exports = orderTypeDef;
