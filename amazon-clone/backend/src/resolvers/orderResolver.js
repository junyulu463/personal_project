const Order = require('../models/Order');
const User = require('../models/User');

const orderResolver = {
  Query: {
    getOrders: async () => await Order.find(),
    getOrder: async (_, { id }) => await Order.findById(id),
  },
  Mutation: {
    addOrder: async (_, args) => {
      const order = new Order(args);
      const savedOrder = await order.save();

      // Add to user.orderHistory
      await User.findByIdAndUpdate(
        args.user, // user id
        {
          $push: {
            orderHistory: {
              order: savedOrder._id,
              timestamp: new Date()
            }
          }
        }
      );
    
      return savedOrder;
    },
    updateOrder: async (_, { id, ...updates }) => {
      return await Order.findByIdAndUpdate(id, updates, { new: true });
    },
    deleteOrder: async (_, { id }) => {
      return await Order.findByIdAndDelete(id);
    }
  }
};

module.exports = orderResolver;
