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
  }
};

module.exports = userResolver;
