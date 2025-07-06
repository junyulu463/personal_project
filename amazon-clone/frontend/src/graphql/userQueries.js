import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      _id
      username
      password
      email
      name
      address
      phone
      role
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
      shippingAddresses {
        _id
        label
        recipient
        address
        city
        postalCode
        country
        isDefault
      }
      defaultShippingAddressId
      billingAddresses {
        _id
        label
        recipient
        address
        city
        postalCode
        country
        isDefault
      }
      defaultBillingAddressId
      paymentMethods {
        _id
        cardType
        cardNumber
        cardholderName
        expMonth
        expYear
        cvv
        billingAddress {
          _id
          label
          recipient
          address
          city
          postalCode
          country
          isDefault
        }
        isDefault
      }
      defaultPaymentMethodId
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
      address
      phone
      role
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
      shippingAddresses {
        _id
        label
        recipient
        address
        city
        postalCode
        country
        isDefault
      }
      defaultShippingAddressId
      billingAddresses {
        _id
        label
        recipient
        address
        city
        postalCode
        country
        isDefault
      }
      defaultBillingAddressId
      paymentMethods {
        _id
        cardType
        cardNumber
        cardholderName
        expMonth
        expYear
        cvv
        billingAddress {
          _id
          label
          recipient
          address
          city
          postalCode
          country
          isDefault
        }
        isDefault
      }
      defaultPaymentMethodId
    }
  }
`;


export const ADD_USER = gql`
  mutation AddUser(
    $username: String!
    $password: String!
    $email: String!
    $name: String
    $address: String
    $phone: String
    $role: String
    $shippingAddresses: [AddressInput]
    $billingAddresses: [AddressInput]
    $paymentMethods: [PaymentMethodInput]
  ) {
    addUser(
      username: $username
      password: $password
      email: $email
      name: $name
      address: $address
      phone: $phone
      role: $role
      shippingAddresses: $shippingAddresses
      billingAddresses: $billingAddresses
      paymentMethods: $paymentMethods
    ) {
      _id
      username
      email
      name
      address
      phone
      role
      shippingAddresses { _id label address city }
      billingAddresses { _id label address city }
      paymentMethods {
        _id
        cardType
        cardNumber
        cardholderName
        expMonth
        expYear
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
    $address: String
    $phone: String
    $role: String
    $shippingAddresses: [AddressInput]
    $billingAddresses: [AddressInput]
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
      address: $address
      phone: $phone
      role: $role
      shippingAddresses: $shippingAddresses
      billingAddresses: $billingAddresses
      paymentMethods: $paymentMethods
      defaultShippingAddressId: $defaultShippingAddressId
      defaultBillingAddressId: $defaultBillingAddressId
      defaultPaymentMethodId: $defaultPaymentMethodId
    ) {
      _id
      username
      email
      address
      shippingAddresses { _id label address city isDefault }
      billingAddresses { _id label address city isDefault }
      paymentMethods {
        _id
        cardType
        cardNumber
        cardholderName
        expMonth
        expYear
        isDefault
      }
      defaultShippingAddressId
      defaultBillingAddressId
      defaultPaymentMethodId
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

export const ADD_SHIPPING_ADDRESS = gql`
  mutation AddShippingAddress($userId: ID!, $address: AddressInput!) {
    addShippingAddress(userId: $userId, address: $address) {
      _id
      shippingAddresses { _id label address isDefault }
      defaultShippingAddressId
    }
  }
`;

export const UPDATE_SHIPPING_ADDRESS = gql`
  mutation UpdateShippingAddress($userId: ID!, $addressId: ID!, $address: AddressInput!) {
    updateShippingAddress(userId: $userId, addressId: $addressId, address: $address) {
      _id
      shippingAddresses { _id label address isDefault }
      defaultShippingAddressId
    }
  }
`;

export const DELETE_SHIPPING_ADDRESS = gql`
  mutation DeleteShippingAddress($userId: ID!, $addressId: ID!) {
    deleteShippingAddress(userId: $userId, addressId: $addressId) {
      _id
      shippingAddresses { _id label }
      defaultShippingAddressId
    }
  }
`;

export const SET_DEFAULT_SHIPPING_ADDRESS = gql`
  mutation SetDefaultShippingAddress($userId: ID!, $addressId: ID!) {
    setDefaultShippingAddress(userId: $userId, addressId: $addressId) {
      _id
      defaultShippingAddressId
      shippingAddresses { _id isDefault }
    }
  }
`;

export const ADD_BILLING_ADDRESS = gql`
  mutation AddBillingAddress($userId: ID!, $address: AddressInput!) {
    addBillingAddress(userId: $userId, address: $address) {
      _id
      billingAddresses { _id label address isDefault }
      defaultBillingAddressId
    }
  }
`;

export const UPDATE_BILLING_ADDRESS = gql`
  mutation UpdateBillingAddress($userId: ID!, $addressId: ID!, $address: AddressInput!) {
    updateBillingAddress(userId: $userId, addressId: $addressId, address: $address) {
      _id
      billingAddresses { _id label address isDefault }
      defaultBillingAddressId
    }
  }
`;

export const DELETE_BILLING_ADDRESS = gql`
  mutation DeleteBillingAddress($userId: ID!, $addressId: ID!) {
    deleteBillingAddress(userId: $userId, addressId: $addressId) {
      _id
      billingAddresses { _id label }
      defaultBillingAddressId
    }
  }
`;

export const SET_DEFAULT_BILLING_ADDRESS = gql`
  mutation SetDefaultBillingAddress($userId: ID!, $addressId: ID!) {
    setDefaultBillingAddress(userId: $userId, addressId: $addressId) {
      _id
      defaultBillingAddressId
      billingAddresses { _id isDefault }
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

