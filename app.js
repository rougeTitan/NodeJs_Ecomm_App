// Core Node.js modules
const path = require('path'); // For handling file and directory paths
const fs = require('fs'); // For file system operations (reading SSL certificates)
const https = require('https'); // For creating HTTPS server

// Third-party packages for web application functionality
const express = require('express'); // Web framework for Node.js
const bodyParser = require('body-parser'); // Parse incoming request bodies
const mongoose = require('mongoose'); // MongoDB object modeling library
const session = require('express-session'); // Session middleware for Express
const MongoDBStore = require('connect-mongodb-session')(session); // Store sessions in MongoDB
const csrf = require('csurf'); // CSRF protection middleware
const flash = require('connect-flash'); // Flash message middleware for user feedback
const multer = require('multer'); // Middleware for handling file uploads
const helmet = require('helmet'); // Security middleware that sets various HTTP headers
const compression = require('compression'); // Compression middleware to reduce response size
const morgan = require('morgan'); // HTTP request logging middleware

// Import custom controllers and middleware
const errorController = require('./controllers/error'); // Handles 404 and 500 error pages
const shopController = require('./controllers/shop'); // Handles shop-related functionality
const isAuth = require('./middleware/is-auth'); // Custom middleware to check if user is authenticated
const User = require('./models/user'); // User model for database operations

// MongoDB connection string constructed from environment variables
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
}@cluster0-ntrwp.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;

// Initialize Express application
const app = express();

// Configure MongoDB session store to persist sessions in database
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// Initialize CSRF protection middleware
const csrfProtection = csrf();

// Read SSL certificate files for HTTPS (private key and certificate)
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');

// Configure multer for file upload handling
const fileStorage = multer.diskStorage({
  // Set destination folder for uploaded files
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  // Generate unique filename using timestamp and original name
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

// File filter to only accept image files (png, jpg, jpeg)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(null, false); // Reject the file
  }
};

// Set EJS as the template engine
app.set('view engine', 'ejs');
// Set the views directory
app.set('views', 'views');

// Import route modules
const adminRoutes = require('./routes/admin'); // Admin panel routes
const shopRoutes = require('./routes/shop'); // Shop functionality routes
const authRoutes = require('./routes/auth'); // Authentication routes

// Create write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' } // Append mode
);

// Apply security middleware - sets various HTTP headers for security
app.use(helmet());
// Enable compression to reduce response size
app.use(compression());
// Log HTTP requests to access.log file using combined format
app.use(morgan('combined', { stream: accessLogStream }));

// Parse URL-encoded bodies (from HTML forms)
app.use(bodyParser.urlencoded({ extended: false }));
// Configure multer middleware for handling single image uploads
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded images from images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Configure session middleware
app.use(
  session({
    secret: 'my secret', // Secret used to sign session ID cookie
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: store // Use MongoDB to store sessions
  })
);

// Initialize flash messages middleware for user feedback
app.use(flash());

// Middleware to make authentication status available in all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

// Middleware to attach user object to request if user is logged in
app.use((req, res, next) => {
  // throw new Error('Sync Dummy'); // Uncomment for testing error handling
  if (!req.session.user) {
    return next(); // No user in session, continue without user object
  }
  // Find user in database and attach to request object
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next(); // User not found in database, continue without user object
      }
      req.user = user; // Attach user object to request
      next();
    })
    .catch(err => {
      next(new Error(err)); // Pass error to error handling middleware
    });
});

// Special route for creating orders (placed before CSRF protection)
app.post('/create-order', isAuth, shopController.postOrder);

// Enable CSRF protection for all routes after this point
app.use(csrfProtection);

// Middleware to make CSRF token available in all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Register route handlers
app.use('/admin', adminRoutes); // Admin routes with /admin prefix
app.use(shopRoutes); // Shop routes (root level)
app.use(authRoutes); // Authentication routes (root level)

// Explicit route for 500 error page
app.get('/500', errorController.get500);

// Catch-all middleware for 404 errors (must be last route)
app.use(errorController.get404);

// Global error handling middleware
app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...); // Custom error handling
  // res.redirect('/500'); // Alternative error handling
  
  // Render 500 error page for any unhandled errors
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

// Connect to MongoDB and start the server
mongoose
  .connect(MONGODB_URI)
  .then(result => {
    // Option 1: HTTPS server (currently commented out)
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
    
    // Option 2: HTTP server (currently active)
    // Start HTTP server on specified port or default to 3000
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err); // Log any database connection errors
  });
