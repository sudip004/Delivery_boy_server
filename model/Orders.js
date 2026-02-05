const mongoose = require("mongoose");

/* ---------- Location (Embedded) ---------- */
const LocationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  { _id: false }
);

/* ---------- Cart Item ---------- */
const CartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

/* ---------- Order ---------- */
const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    address: {
      type: String
    },

    paymentMethod: {
      type: String
    },

    paymentStatus: {
      type: String
    },

    items: {
      type: [CartItemSchema],
      default: []
    },

    orderStatus: {
      type: String,
      default: "Order-Placed"
    },

    orderDate: {
      type: Date,
      default: Date.now
    },

    restaurantLocation: {
      type: LocationSchema
    },

    customerLocation: {
      type: LocationSchema
    },

    deliveryBoyLocation: {
      type: LocationSchema
    }
  },
  {
    timestamps: false, // you already manage orderDate
    minimize: false
  }
);

// Indexes for faster queries
OrderSchema.index({ userId: 1, orderDate: -1 });
OrderSchema.index({ orderStatus: 1, orderDate: -1 });

const orderModel = mongoose.model(
  "Order",
  OrderSchema,
  "orders" // 👈 SAME collection name as Spring Boot
);

module.exports={orderModel}
