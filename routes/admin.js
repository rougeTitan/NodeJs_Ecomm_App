// Import required modules
const path = require('path'); // For handling file paths
const express = require('express'); // Web framework
const { body } = require('express-validator/check'); // For input validation

// Import controllers and middleware
const adminController = require('../controllers/admin'); // Admin functionality controller
const isAuth = require('../middleware/is-auth'); // Authentication middleware

// Create Express router
const router = express.Router();

// GET route to display add product form
// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// GET route to display all products for admin management
// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// POST route to create new product with validation
// /admin/add-product => POST
router.post(
  '/add-product',
  [
    // Validate product title: must be string, minimum 3 characters, trimmed
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    // Validate product price: must be a valid float/number
    body('price').isFloat(),
    // Validate product description: minimum 5 chars, maximum 400 chars, trimmed
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth, // Ensure user is authenticated
  adminController.postAddProduct // Handle the form submission
);

// GET route to display edit product form
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// POST route to update existing product with validation
router.post(
  '/edit-product',
  [
    // Same validation rules as add product
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth, // Ensure user is authenticated
  adminController.postEditProduct // Handle the form submission
);

// DELETE route to remove a product (AJAX endpoint)
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

// Export the router to be used in main app
module.exports = router;
