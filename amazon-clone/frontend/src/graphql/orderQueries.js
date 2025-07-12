import { gql } from '@apollo/client';

export const GET_ORDERS_BY_IDS = gql`
  query GetOrdersByIds($ids: [ID!]!) {
    getOrdersByIds(ids: $ids) {
      _id
      orderItems {
        product
        qty
      }
    }
  }
`;


export const GET_ORDERS = gql`
  query {
    getOrders {
      _id
      user
      totalPrice
      isPaid
      createdAt
      isDelivered
      deliveredAt
      shippingAddress { address city postalCode country recipient label }
      billingAddress { address city postalCode country recipient label }   
      paymentMethod {                                                     
        cardType
        cardNumber
        cardholderName
        expMonth
        expYear
      }
      orderItems {
        product
        name
        qty
        price
        image
        seller               
        isDelivered           
        deliveredAt          
      }
    }
  }
`;


export const ADD_ORDER = gql`
  mutation AddOrder(
    $user: ID!
    $orderItems: [OrderItemInput!]!
    $shippingAddress: ShippingAddressInput!
    $billingAddress: BillingAddressInput!      
    $paymentMethod: PaymentMethodSnapshotInput! 
    $paymentResult: PaymentResultInput
    $itemsPrice: Float!
    $shippingPrice: Float!
    $taxPrice: Float!
    $totalPrice: Float!
    $isPaid: Boolean
    $paidAt: String
    $isDelivered: Boolean
    $deliveredAt: String
  ) {
    addOrder(
      user: $user
      orderItems: $orderItems
      shippingAddress: $shippingAddress
      billingAddress: $billingAddress
      paymentMethod: $paymentMethod
      paymentResult: $paymentResult
      itemsPrice: $itemsPrice
      shippingPrice: $shippingPrice
      taxPrice: $taxPrice
      totalPrice: $totalPrice
      isPaid: $isPaid
      paidAt: $paidAt
      isDelivered: $isDelivered
      deliveredAt: $deliveredAt
    ) {
      _id
      user
      totalPrice
      isPaid
      isDelivered
      orderItems {
        product
        name
        qty
        price
        image
        seller
        isDelivered
        deliveredAt
      }
      shippingAddress { address city }
      billingAddress { address city }
      paymentMethod {
        cardType
        cardNumber
        cardholderName
        expMonth
        expYear
      }
    }
  }
`;


export const DELETE_ORDER = gql`
  mutation DeleteOrder($id: ID!) {
    deleteOrder(id: $id) {
      _id
    }
  }
`;


export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    getOrder(id: $id) {
      _id
      user
      totalPrice
      isPaid
      createdAt
      isDelivered
      deliveredAt
      shippingAddress { address city postalCode country recipient label }
      billingAddress { address city postalCode country recipient label }
      paymentMethod {
        cardType
        cardNumber
        cardholderName
        expMonth
        expYear
      }
      orderItems {
        product
        name
        qty
        price
        image
        seller
        isDelivered
        deliveredAt
      }
      paymentResult {
        id
        status
        update_time
        email_address
      }
    }
  }
`;


export const UPDATE_ORDER = gql`
mutation UpdateOrder(
  $id: ID!
  $isPaid: Boolean
  $paidAt: String
  $isDelivered: Boolean
  $deliveredAt: String
  $paymentResult: PaymentResultInput
  $orderItems: [OrderItemUpdateInput]
  $shippingAddress: ShippingAddressInput     
  $billingAddress: BillingAddressInput       
  $paymentMethod: PaymentMethodSnapshotInput 
  $itemsPrice: Float                        
  $shippingPrice: Float                     
  $taxPrice: Float                          
  $totalPrice: Float                        
) {
  updateOrder(
    id: $id
    isPaid: $isPaid
    paidAt: $paidAt
    isDelivered: $isDelivered
    deliveredAt: $deliveredAt
    paymentResult: $paymentResult
    orderItems: $orderItems
    shippingAddress: $shippingAddress       
    billingAddress: $billingAddress         
    paymentMethod: $paymentMethod           
    itemsPrice: $itemsPrice                 
    shippingPrice: $shippingPrice           
    taxPrice: $taxPrice                     
    totalPrice: $totalPrice                 
  ) {
    _id
    isPaid
    paidAt
    isDelivered
    deliveredAt
    orderItems { product isDelivered deliveredAt }
    paymentResult { id status update_time email_address }
  }
}

`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!, $productId: ID) {
    cancelOrder(orderId: $orderId, productId: $productId) {
      _id
      orderItems {
        product
        name
        qty
        isDelivered
        deliveredAt
      }
      isPaid
      paidAt
      isDelivered
      deliveredAt
    }
  }
`;



