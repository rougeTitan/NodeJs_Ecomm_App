// Import required modules
const express = require('express'); // Web framework
const { check, body } = require('express-validator/check'); // For input validation

// Import controllers and models
const authController = require('../controllers/auth'); // Authentication controller
const User = require('../models/user'); // User model for database operations

// Create Express router
const router = express.Router();

// GET route to display login form
router.get('/login', authController.getLogin);

// GET route to display signup form
router.get('/signup', authController.getSignup);

// POST route to handle login with validation
router.post(
  '/login',
  [
    // Validate email format and normalize it
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    // Validate password: minimum 5 characters, alphanumeric only
    body('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin // Handle login form submission
);

// POST route to handle signup with extensive validation
router.post(
  '/signup',
  [
    // Validate email and check for uniqueness in database
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        // Custom validation to check if email already exists
        // if (value === 'test@test.com') {
        //   throw new Error('This email address if forbidden.');
        // }
        // return true;
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      .normalizeEmail(),
    // Validate password with custom error message
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({ min: 5 }) // Minimum 5 characters
      .isAlphanumeric() // Only letters and numbers
      .trim(),
    // Validate password confirmation matches password
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match!');
        }
        return true; // Validation passed
      })
  ],
  authController.postSignup // Handle signup form submission
);

// POST route to handle logout
router.post('/logout', authController.postLogout);

// GET route to display password reset request form
router.get('/reset', authController.getReset);

// POST route to handle password reset request
router.post('/reset', authController.postReset);

// GET route to display new password form (with token from email)
router.get('/reset/:token', authController.getNewPassword);

// POST route to handle setting new password
router.post('/new-password', authController.postNewPassword);

// Export the router to be used in main app
module.exports = router;
