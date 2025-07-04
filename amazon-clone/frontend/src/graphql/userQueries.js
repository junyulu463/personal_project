import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      _id
      username
      password
      email
      name
      phone
      role

      # NEW
      addresses {
        _id
        label
        recipient
        address
        city
        postalCode
        country
        isDefault
        isBilling
      }
      defaultShippingAddress {
        _id
        address
        city
        postalCode
        country
      }
      defaultBillingAddress {
        _id
        address
        city
        postalCode
        country
      }

      paymentMethods {
        _id
        cardType
        cardNumber
        nameOnCard
        expiryMonth
        expiryYear
        isDefault
        billingAddress {
          _id
          address
          city
        }
      }
      defaultPaymentMethod {
        _id
        cardType
        cardNumber
        nameOnCard
        expiryMonth
        expiryYear
      }

      # keep these
      cart {
        _id
        product
        quantity
      }
      orderHistory {
        _id
        order
        timestamp
      }
      unpaidOrders {
        _id
        order
        timestamp
      }
      searchHistory {
        _id
        query
        timestamp
      }
      productViewHistory {
        _id
        product
        timestamp
      }
    }
  }
`;



export const GET_USERS = gql`
  query {
    getUsers {
      _id
      username
      password
      email
      name
      phone
      role
      addresses {
        _id
        label
        recipient
        address
        city
        postalCode
        country
        isDefault
        isBilling
      }
      defaultShippingAddress {
        _id
        address
        city
        postalCode
        country
      }
      defaultBillingAddress {
        _id
        address
        city
        postalCode
        country
      }
      paymentMethods {
        _id
        cardType
        cardNumber
        nameOnCard
        expiryMonth
        expiryYear
        isDefault
        billingAddress {
          _id
          address
          city
        }
      }
      defaultPaymentMethod {
        _id
        cardType
        cardNumber
        nameOnCard
        expiryMonth
        expiryYear
      }
      cart {
        _id
        product
        quantity
      }
      orderHistory {
        _id
        order
        timestamp
      }
      unpaidOrders {
        _id
        order
        timestamp
      }
      searchHistory {
        _id
        query
        timestamp
      }
      productViewHistory {
        _id
        product
        timestamp
      }
    }
  }
`;


export const ADD_USER = gql`
  mutation AddUser(
    $username: String!
    $password: String!
    $email: String!
    $name: String
    $phone: String
    $role: String
    $addresses: [AddressInput]
    $paymentMethods: [PaymentMethodInput]
  ) {
    addUser(
      username: $username
      password: $password
      email: $email
      name: $name
      phone: $phone
      role: $role
      addresses: $addresses
      paymentMethods: $paymentMethods
    ) {
      _id
      username
      email
      addresses {
        _id
        label
        address
        city
      }
      paymentMethods {
        _id
        cardType
        cardNumber
        nameOnCard
        expiryMonth
        expiryYear
      }
    }
  }
`;


export const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $username: String
    $password: String
    $email: String
    $name: String
    $phone: String
    $role: String
    $addresses: [AddressInput]
    $paymentMethods: [PaymentMethodInput]
    $defaultShippingAddressId: ID
    $defaultBillingAddressId: ID
    $defaultPaymentMethodId: ID
  ) {
    updateUser(
      id: $id
      username: $username
      password: $password
      email: $email
      name: $name
      phone: $phone
      role: $role
      addresses: $addresses
      paymentMethods: $paymentMethods
      defaultShippingAddressId: $defaultShippingAddressId
      defaultBillingAddressId: $defaultBillingAddressId
      defaultPaymentMethodId: $defaultPaymentMethodId
    ) {
      _id
      username
      email
      addresses {
        _id
        label
        address
        city
        isDefault
      }
      paymentMethods {
        _id
        cardType
        cardNumber
        nameOnCard
        expiryMonth
        expiryYear
        isDefault
      }
      defaultShippingAddress {
        _id
        address
        city
      }
      defaultBillingAddress {
        _id
        address
        city
      }
      defaultPaymentMethod {
        _id
        cardType
        cardNumber
      }
    }
  }
`;


export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      _id
      username
    }
  }
`;

export const ADD_ORDER_TO_HISTORY = gql`
  mutation AddOrderToHistory($userId: ID!, $orderId: ID!) {
    addOrderToHistory(userId: $userId, orderId: $orderId) {
      _id
      orderHistory {
        _id
        order
        timestamp
      }
    }
  }
`;

export const ADD_UNPAID_ORDER = gql`
  mutation AddUnpaidOrder($userId: ID!, $orderId: ID!) {
    addUnpaidOrder(userId: $userId, orderId: $orderId) {
      _id
      unpaidOrders {
        _id
        order
        timestamp
      }
    }
  }
`;

export const REMOVE_UNPAID_ORDER = gql`
  mutation RemoveUnpaidOrder($userId: ID!, $orderId: ID!) {
    removeUnpaidOrder(userId: $userId, orderId: $orderId) {
      _id
      unpaidOrders {
        _id
        order
        timestamp
      }
    }
  }
`;

export const ADD_SEARCH_HISTORY = gql`
  mutation AddSearchHistory($userId: ID!, $query: String!) {
    addSearchHistory(userId: $userId, query: $query) {
      _id
      searchHistory {
        _id
        query
        timestamp
      }
    }
  }
`;

export const CLEAR_SEARCH_HISTORY = gql`
  mutation ClearSearchHistory($userId: ID!) {
    clearSearchHistory(userId: $userId) {
      _id
      searchHistory {
        _id
        query
        timestamp
      }
    }
  }
`;

export const ADD_PRODUCT_VIEW = gql`
  mutation AddProductView($userId: ID!, $productId: ID!) {
    addProductView(userId: $userId, productId: $productId) {
      _id
      productViewHistory {
        _id
        product
        timestamp
      }
    }
  }
`;

export const CLEAR_PRODUCT_VIEW_HISTORY = gql`
  mutation ClearProductViewHistory($userId: ID!) {
    clearProductViewHistory(userId: $userId) {
      _id
      productViewHistory {
        _id
        product
        timestamp
      }
    }
  }
`;

export const REMOVE_SEARCH_HISTORY_ENTRY = gql`
  mutation RemoveSearchHistoryEntry($userId: ID!, $entryId: ID!) {
    removeSearchHistoryEntry(userId: $userId, entryId: $entryId) {
      _id
      searchHistory {
        _id
        query
        timestamp
      }
    }
  }
`;

export const REMOVE_PRODUCT_VIEW_ENTRY = gql`
  mutation RemoveProductViewEntry($userId: ID!, $entryId: ID!) {
    removeProductViewEntry(userId: $userId, entryId: $entryId) {
      _id
      productViewHistory {
        _id
        product
        timestamp
      }
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($userId: ID!, $productId: ID!, $quantity: Int) {
    addToCart(userId: $userId, productId: $productId, quantity: $quantity) {
      _id
      cart {
        _id
        product
        quantity
      }
    }
  }
`;

export const UPDATE_CART_QUANTITY = gql`
  mutation UpdateCartQuantity($userId: ID!, $productId: ID!, $quantity: Int!) {
    updateCartQuantity(userId: $userId, productId: $productId, quantity: $quantity) {
      _id
      cart {
        _id
        product
        quantity
      }
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($userId: ID!, $productId: ID!) {
    removeFromCart(userId: $userId, productId: $productId) {
      _id
      cart {
        _id
        product
        quantity
      }
    }
  }
`;

export const ADD_ADDRESS = gql`
  mutation AddAddress($userId: ID!, $address: AddressInput!) {
    addAddress(userId: $userId, address: $address) {
      _id
      addresses {
        _id
        label
        address
        isDefault
      }
    }
  }
`;

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($userId: ID!, $addressId: ID!, $address: AddressInput!) {
    updateAddress(userId: $userId, addressId: $addressId, address: $address) {
      _id
      addresses {
        _id
        label
        address
        isDefault
      }
    }
  }
`;

export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($userId: ID!, $addressId: ID!) {
    deleteAddress(userId: $userId, addressId: $addressId) {
      _id
      addresses {
        _id
        label
      }
    }
  }
`;

export const SET_DEFAULT_SHIPPING_ADDRESS = gql`
  mutation SetDefaultShippingAddress($userId: ID!, $addressId: ID!) {
    setDefaultShippingAddress(userId: $userId, addressId: $addressId) {
      _id
      defaultShippingAddress {
        _id
        address
      }
      addresses {
        _id
        isDefault
      }
    }
  }
`;

export const SET_DEFAULT_BILLING_ADDRESS = gql`
  mutation SetDefaultBillingAddress($userId: ID!, $addressId: ID!) {
    setDefaultBillingAddress(userId: $userId, addressId: $addressId) {
      _id
      defaultBillingAddress {
        _id
        address
      }
      addresses {
        _id
        isBilling
      }
    }
  }
`;

export const ADD_PAYMENT_METHOD = gql`
  mutation AddPaymentMethod($userId: ID!, $paymentMethod: PaymentMethodInput!) {
    addPaymentMethod(userId: $userId, paymentMethod: $paymentMethod) {
      _id
      paymentMethods {
        _id
        cardType
        cardNumber
        isDefault
      }
    }
  }
`;

export const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod($userId: ID!, $paymentMethodId: ID!, $paymentMethod: PaymentMethodInput!) {
    updatePaymentMethod(userId: $userId, paymentMethodId: $paymentMethodId, paymentMethod: $paymentMethod) {
      _id
      paymentMethods {
        _id
        cardType
        cardNumber
        isDefault
      }
    }
  }
`;

export const DELETE_PAYMENT_METHOD = gql`
  mutation DeletePaymentMethod($userId: ID!, $paymentMethodId: ID!) {
    deletePaymentMethod(userId: $userId, paymentMethodId: $paymentMethodId) {
      _id
      paymentMethods {
        _id
        cardType
      }
    }
  }
`;

export const SET_DEFAULT_PAYMENT_METHOD = gql`
  mutation SetDefaultPaymentMethod($userId: ID!, $paymentMethodId: ID!) {
    setDefaultPaymentMethod(userId: $userId, paymentMethodId: $paymentMethodId) {
      _id
      defaultPaymentMethod {
        _id
        cardType
      }
      paymentMethods {
        _id
        isDefault
      }
    }
  }
`;

export const REMOVE_MANY_FROM_CART = gql`
  mutation RemoveManyFromCart($userId: ID!, $productIds: [ID!]!) {
    removeManyFromCart(userId: $userId, productIds: $productIds) {
      _id
      cart {
        _id
        product
        quantity
      }
    }
  }
`;


