// Import required modules
const path = require('path'); // For handling file paths
const express = require('express'); // Web framework

// Import controllers and middleware
const shopController = require('../controllers/shop'); // Shop functionality controller
const isAuth = require('../middleware/is-auth'); // Authentication middleware

// Create Express router
const router = express.Router();

// Public routes (no authentication required)
router.get('/', shopController.getIndex); // Home page - display featured products
router.get('/products', shopController.getProducts); // Product listing page with pagination
router.get('/products/:productId', shopController.getProduct); // Individual product detail page

// Protected routes (authentication required)
router.get('/cart', isAuth, shopController.getCart); // View shopping cart
router.post('/cart', isAuth, shopController.postCart); // Add item to cart
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct); // Remove item from cart
router.get('/checkout', isAuth, shopController.getCheckout); // Checkout page with Stripe payment
router.get('/orders', isAuth, shopController.getOrders); // View order history
router.get('/orders/:orderId', isAuth, shopController.getInvoice); // Download order invoice as PDF

// Export the router to be used in main app
module.exports = router;
