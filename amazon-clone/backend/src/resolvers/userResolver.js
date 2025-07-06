const User = require('../models/User');

const userResolver = {
  Query: {
    getUsers: async () => await User.find(),
    getUser: async (_, { id }) => await User.findById(id),
  },
  Mutation: {
    addUser: async (_, args) => {
      try {
        // If no role provided, default to 'buyer'
        if (!args.role) args.role = 'buyer';
        const user = new User(args);
        return await user.save();
      } catch (err) {
        if (
          err.code === 11000 ||
          (err.message && err.message.includes("duplicate key"))
        ) {
          throw new Error("Username or email already exists.");
        }
        throw err;
      }
    },    
    updateUser: async (_, { id, ...updates }) => {
      if (updates.role && !['admin', 'seller', 'buyer'].includes(updates.role)) {
        throw new Error("Invalid role. Allowed values: admin, seller, buyer.");
      }
      return await User.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteUser: async (_, { id }) => {
      return await User.findByIdAndDelete(id);
    },

    // Cart operations
    addToCart: async (_, { userId, productId, quantity = 1 }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      const item = user.cart.find(i => i.product.toString() === productId);
      if (item) {
        item.quantity += quantity;
      } else {
        user.cart.push({ product: productId, quantity });
      }
      await user.save();
      return user;
    },

    updateCartQuantity: async (_, { userId, productId, quantity }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      const item = user.cart.find(i => i.product.toString() === productId);
      if (!item) throw new Error('Product not in cart');
      item.quantity = quantity;
      await user.save();
      return user;
    },      

    removeFromCart: async (_, { userId, productId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.cart = user.cart.filter(i => i.product.toString() !== productId);
      await user.save();
      return user;
    },

    removeManyFromCart: async (_, { userId, productIds }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.cart = user.cart.filter(i => !productIds.includes(i.product.toString()));
      await user.save();
      return user;
    },    

    clearCart: async (_, { userId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.cart = [];
      await user.save();
      return user;
    },

    // ---- NEW: Order History, Unpaid Orders, Search History ----

    // Order History
// Order History
    addOrderToHistory: async (_, { userId, orderId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      if (!user.orderHistory.some(entry => entry.order.toString() === orderId)) {
        user.orderHistory.push({
          order: orderId,
          timestamp: new Date()
        });
        await user.save();
      }
      return user;
    },

    addUnpaidOrder: async (_, { userId, orderId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      if (!user.unpaidOrders.some(entry => entry.order.toString() === orderId)) {
        user.unpaidOrders.push({
          order: orderId,
          timestamp: new Date()
        });
        await user.save();
      }
      return user;
    },
    removeUnpaidOrder: async (_, { userId, orderId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.unpaidOrders = user.unpaidOrders.filter(entry => entry.order.toString() !== orderId);
      // Also remove from orderHistory if present (for unpaid, not paid)
      user.orderHistory = user.orderHistory.filter(ref => ref.order.toString() !== orderId);      
      await user.save();
      return user;
    },

    // --- Search History ---
    addSearchHistory: async (_, { userId, query }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.searchHistory.push({
        query,
        timestamp: new Date()
      });
      await user.save();
      return user;
    },

    clearSearchHistory: async (_, { userId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.searchHistory = [];
      await user.save();
      return user;
    },

    removeSearchHistoryEntry: async (_, { userId, entryId }) => {
      // Remove search history entry by subdocument _id
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.searchHistory = user.searchHistory.filter(
        entry => entry._id.toString() !== entryId
      );
      await user.save();
      return user;
    },

    // --- Product View History ---
    addProductView: async (_, { userId, productId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.productViewHistory.push({
        product: productId,
        timestamp: new Date()
      });
      await user.save();
      return user;
    },

    clearProductViewHistory: async (_, { userId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.productViewHistory = [];
      await user.save();
      return user;
    },

    removeProductViewEntry: async (_, { userId, entryId }) => {
      // Remove product view entry by subdocument _id
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.productViewHistory = user.productViewHistory.filter(
        entry => entry._id.toString() !== entryId
      );
      await user.save();
      return user;
    }, 
    
    // --- Shipping Addresses ---
    addShippingAddress: async (_, { userId, address }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      if (address.isDefault) {
        user.shippingAddresses.forEach(addr => addr.isDefault = false);
        user.defaultShippingAddressId = undefined;
      }
      user.shippingAddresses.push(address);
      // If new address is default, set defaultShippingAddressId to it
      if (address.isDefault) {
        const lastAddr = user.shippingAddresses[user.shippingAddresses.length - 1];
        user.defaultShippingAddressId = lastAddr._id;
      }
      await user.save();
      return user;
    },

    updateShippingAddress: async (_, { userId, addressId, address }) => {
      console.log("shipping arraive");
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      const addr = user.shippingAddresses.id(addressId);
      if (!addr) throw new Error('Address not found');
      Object.assign(addr, address);
      if (address.isDefault) {
        user.shippingAddresses.forEach(a => { if (!a._id.equals(addressId)) a.isDefault = false; });
        user.defaultShippingAddressId = addr._id;
      }
      await user.save();
      return user;
    },

    deleteShippingAddress: async (_, { userId, addressId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.shippingAddresses = user.shippingAddresses.filter(addr => addr._id.toString() !== addressId);
      // If default is deleted, clear defaultShippingAddressId
      if (user.defaultShippingAddressId && user.defaultShippingAddressId.toString() === addressId) {
        user.defaultShippingAddressId = undefined;
      }
      await user.save();
      return user;
    },

    setDefaultShippingAddress: async (_, { userId, addressId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.shippingAddresses.forEach(addr => addr.isDefault = addr._id.toString() === addressId);
      user.defaultShippingAddressId = addressId;
      await user.save();
      return user;
    },

    // --- Billing Addresses (same structure as shipping) ---
    addBillingAddress: async (_, { userId, address }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      if (address.isDefault) {
        user.billingAddresses.forEach(addr => addr.isDefault = false);
        user.defaultBillingAddressId = undefined;
      }
      user.billingAddresses.push(address);
      if (address.isDefault) {
        const lastAddr = user.billingAddresses[user.billingAddresses.length - 1];
        user.defaultBillingAddressId = lastAddr._id;
      }
      await user.save();
      return user;
    },

    updateBillingAddress: async (_, { userId, addressId, address }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      const addr = user.billingAddresses.id(addressId);
      if (!addr) throw new Error('Address not found');
      Object.assign(addr, address);
      if (address.isDefault) {
        user.billingAddresses.forEach(a => { if (!a._id.equals(addressId)) a.isDefault = false; });
        user.defaultBillingAddressId = addr._id;
      }
      await user.save();
      return user;
    },

    deleteBillingAddress: async (_, { userId, addressId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.billingAddresses = user.billingAddresses.filter(addr => addr._id.toString() !== addressId);
      if (user.defaultBillingAddressId && user.defaultBillingAddressId.toString() === addressId) {
        user.defaultBillingAddressId = undefined;
      }
      await user.save();
      return user;
    },

    setDefaultBillingAddress: async (_, { userId, addressId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.billingAddresses.forEach(addr => addr.isDefault = addr._id.toString() === addressId);
      user.defaultBillingAddressId = addressId;
      await user.save();
      return user;
    },  

        // Add a new payment method
    addPaymentMethod: async (_, { userId, paymentMethod }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      if (paymentMethod.isDefault) {
        user.paymentMethods.forEach(pm => pm.isDefault = false);
      }
      user.paymentMethods.push(paymentMethod);
      await user.save();
      return user;
    },

    // Update payment method
    updatePaymentMethod: async (_, { userId, paymentMethodId, paymentMethod }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      const pm = user.paymentMethods.id(paymentMethodId);
      if (!pm) throw new Error('Payment method not found');
      Object.assign(pm, paymentMethod);
      if (paymentMethod.isDefault) {
        user.paymentMethods.forEach(p => { if (p._id.toString() !== paymentMethodId) p.isDefault = false; });
      }
      await user.save();
      return user;
    },

    // Delete payment method
    deletePaymentMethod: async (_, { userId, paymentMethodId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.paymentMethods = user.paymentMethods.filter(pm => pm._id.toString() !== paymentMethodId);
      await user.save();
      return user;
    },

    // Set default payment method
    setDefaultPaymentMethod: async (_, { userId, paymentMethodId }) => {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      user.paymentMethods.forEach(pm => pm.isDefault = pm._id.toString() === paymentMethodId);
      user.defaultPaymentMethodId = paymentMethodId;
      await user.save();
      return user;
    },
  }
};

module.exports = userResolver;
