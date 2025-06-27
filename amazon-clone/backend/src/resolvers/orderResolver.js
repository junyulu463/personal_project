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

      // If NOT paid, also add to unpaidOrders
      if (!args.isPaid) {
        await User.findByIdAndUpdate(
          args.user,
          { $push: { unpaidOrders: { order: savedOrder._id, timestamp: new Date() } } }
        );
      }      
    
      return savedOrder;
    },

    updateOrder: async (_, { id, ...updates }) => {
      const updatedOrder = await Order.findByIdAndUpdate(id, updates, { new: true });
    
      // If this update marks the order as paid, remove from user's unpaidOrders
      if (updates.isPaid && updatedOrder.user) {
        await User.findByIdAndUpdate(
          updatedOrder.user,
          { $pull: { unpaidOrders: { order: updatedOrder._id } } }
        );
      }
    
      return updatedOrder;
    },
    
    deleteOrder: async (_, { id }) => {
      return await Order.findByIdAndDelete(id);
    }
  }
};

module.exports = orderResolver;
