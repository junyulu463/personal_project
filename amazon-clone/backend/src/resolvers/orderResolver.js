const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const orderResolver = {
  Query: {
    getOrders: async () => await Order.find(),
    getOrder: async (_, { id }) => await Order.findById(id),
    getOrdersByIds: async (_, { ids }) => {
      console.log("laodaozheli");
      return await Order.find({ _id: { $in: ids } });
    }
  },
  Mutation: {
    addOrder: async (_, args) => {
      // 1. Check for enough stock before placing the order!
      // console.log("1");
      for (const item of args.orderItems) {
        // console.log(item.product);
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product not found: ${item.product}`);
        if (product.countInStock < item.qty) {
          throw new Error(`Insufficient stock for ${product.name}. Only ${product.countInStock} left.`);
        }
      }
      // 2. Save order
       console.log("2");
       const order = new Order({
        user: args.user,
        orderItems: args.orderItems,
        shippingAddress: args.shippingAddress,
        billingAddress: args.billingAddress,
        paymentMethod: args.paymentMethod,
        paymentResult: args.paymentResult,
        itemsPrice: args.itemsPrice,
        shippingPrice: args.shippingPrice,
        taxPrice: args.taxPrice,
        totalPrice: args.totalPrice,
        isPaid: args.isPaid || false,
        paidAt: args.paidAt,
        isDelivered: args.isDelivered || false,
        deliveredAt: args.deliveredAt,
      });
    console.log("3");
      const savedOrder = await order.save();
      // 3. Deduct stock for each product
      for (const item of args.orderItems) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { countInStock: -item.qty } }
        );
      }
    
      // 4. User history and unpaid logic
      await User.findByIdAndUpdate(
        args.user,
        {
          $push: {
            orderHistory: {
              order: savedOrder._id,
              timestamp: new Date()
            }
          }
        }
      );
    
      if (!args.isPaid) {
        await User.findByIdAndUpdate(
          args.user,
          { $push: { unpaidOrders: { order: savedOrder._id, timestamp: new Date() } } }
        );
      }
    
      return savedOrder;
    },
    

    // Update order, including per-item delivery status and all other fields
    updateOrder: async (
      _,
      {
        id,
        orderItems,
        shippingAddress,
        billingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        ...updates
      }
    ) => {
      console.log("arrive");
      const order = await Order.findById(id);
      if (!order) throw new Error("Order not found");

      // Update simple scalar fields (isPaid, paidAt, etc)
      for (let key of Object.keys(updates)) {
        if (typeof updates[key] !== "undefined") {
          order[key] = updates[key];
        }
      }

      // Update composite fields if provided
      if (shippingAddress) order.shippingAddress = shippingAddress;
      if (billingAddress) order.billingAddress = billingAddress;
      if (paymentMethod) order.paymentMethod = paymentMethod;
      if (typeof itemsPrice !== "undefined") order.itemsPrice = itemsPrice;
      if (typeof shippingPrice !== "undefined") order.shippingPrice = shippingPrice;
      if (typeof taxPrice !== "undefined") order.taxPrice = taxPrice;
      if (typeof totalPrice !== "undefined") order.totalPrice = totalPrice;

      // Per-item delivery status update
      if (orderItems && orderItems.length > 0) {
        for (let updItem of orderItems) {
          const item = order.orderItems.find(
            (i) => i.product.toString() === updItem.product
          );
          if (item) {
            if (typeof updItem.isDelivered === "boolean")
              item.isDelivered = updItem.isDelivered;
            if (updItem.deliveredAt) item.deliveredAt = updItem.deliveredAt;
          }
        }
      }

      // After updating per-item delivery, check if all delivered
      if (
        order.orderItems.length > 0 &&
        order.orderItems.every(i => i.isDelivered)
      ) {
        order.isDelivered = true;
        // Set deliveredAt as the latest deliveredAt of items (or now if you prefer)
        order.deliveredAt =
          order.orderItems
            .map(i => i.deliveredAt)
            .filter(Boolean)
            .sort()
            .slice(-1)[0] || new Date().toISOString();
      } else {
        order.isDelivered = false;
        order.deliveredAt = null;
      }


      await order.save();

      // If order is now paid, remove from user's unpaidOrders
      if (updates.isPaid && order.user) {
        await User.findByIdAndUpdate(order.user, {
          $pull: { unpaidOrders: { order: order._id } },
        });
      }

      return order;
    },


    // Remove from user arrays when deleting
    deleteOrder: async (_, { id }) => {
      const order = await Order.findById(id);
      if (!order) throw new Error('Order not found');

      await User.findByIdAndUpdate(order.user, {
        $pull: {
          orderHistory: { order: order._id },
          unpaidOrders: { order: order._id }
        }
      });

      return await Order.findByIdAndDelete(id);
    },
    
    cancelOrder: async (_, { orderId, productId }) => {
      const order = await Order.findById(orderId);
      if (!order) throw new Error("Order not found");
      const user = await User.findById(order.user);
    
      // Helper: Restock a product
      const restockProduct = async (item) => {
        await Product.findByIdAndUpdate(item.product, { $inc: { countInStock: item.qty } });
      };
    
      // --- Cancel entire order (if no productId) ---
      if (!productId) {
        // Unpaid: always allow. Paid: only allow if NOT delivered.
        if (!order.isPaid || order.orderItems.every(i => !i.isDelivered)) {
          // Restock all items
          for (const item of order.orderItems) {
            await restockProduct(item);
          }
          // Remove from user orderHistory & unpaidOrders
          await User.findByIdAndUpdate(order.user, {
            $pull: {
              orderHistory: { order: order._id },
              unpaidOrders: { order: order._id }
            }
          });
          // Delete order
          await order.deleteOne();
          return null;
        } else {
          throw new Error("Cannot cancel: Some items are already delivered.");
        }
      }
    
      // --- Cancel single item (if productId provided) ---
      const item = order.orderItems.find(i => i.product.toString() === productId);
      if (!item) throw new Error("Product not found in order");
      if (item.isDelivered) throw new Error("Cannot cancel a delivered item.");
    
      // Remove item and restock
      order.orderItems = order.orderItems.filter(i => i.product.toString() !== productId);
      await restockProduct(item);
    
      // If order has no items left, delete it
      if (order.orderItems.length === 0) {
        await User.findByIdAndUpdate(order.user, {
          $pull: {
            orderHistory: { order: order._id },
            unpaidOrders: { order: order._id }
          }
        });
        await order.deleteOne();
        return null;
      }
    
      // Else, save the updated order
      await order.save();
      return order;
    },       
  }
};

module.exports = orderResolver;
