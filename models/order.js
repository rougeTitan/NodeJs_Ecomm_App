// Import Mongoose for MongoDB object modeling
const mongoose = require('mongoose');

// Get Schema constructor from mongoose
const Schema = mongoose.Schema;

// Define the Order schema structure
const orderSchema = new Schema({
  products: [
    {
      // Store product data as object (snapshot at time of order)
      product: { type: Object, required: true },
      // Quantity of each product ordered
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    // Store user email at time of order
    email: {
      type: String,
      required: true
    },
    // Reference to the User who placed the order
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User' // Reference to User model
    }
  }
});

// Export the Order model based on the schema
module.exports = mongoose.model('Order', orderSchema);
