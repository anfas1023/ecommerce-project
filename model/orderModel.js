const mongoose = require('mongoose');
const orderProducts= new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming each cart item is associated with a product
      ref: 'Product', // Reference to the Product model
      required: true,
    }
  });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    orderDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    products: [orderProducts],
    totalPrice: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
    },
    status: {
        type:String,
        default:'Pending'
    }
    // You can add more fields specific to orders here
});

module.exports = mongoose.model('Order', orderSchema);