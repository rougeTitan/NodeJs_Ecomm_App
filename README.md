# Node.js E-commerce Application with SSL Support

A complete e-commerce web application built with Node.js, Express, and MongoDB, featuring user authentication, shopping cart functionality, payment processing with Stripe, and SSL/HTTPS support.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [SSL Setup](#ssl-setup)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core E-commerce Functionality
- **Product Catalog**: Browse products with pagination (2 items per page)
- **Product Management**: Full CRUD operations for products (admin only)
- **Shopping Cart**: Add, remove, and manage cart items
- **Order Processing**: Complete order workflow with payment integration
- **Invoice Generation**: PDF invoices for completed orders

### User Management
- **Authentication System**: Login/signup with email verification
- **Password Reset**: Secure password reset via email tokens
- **Session Management**: Persistent sessions stored in MongoDB
- **User Profiles**: Individual user accounts with cart persistence

### Security Features
- **CSRF Protection**: Cross-Site Request Forgery protection
- **Input Validation**: Server-side validation with express-validator
- **Password Hashing**: Secure password storage with bcryptjs
- **Security Headers**: HTTP security headers via Helmet
- **File Upload Security**: Image-only file uploads with validation

### Payment & Communication
- **Stripe Integration**: Secure payment processing
- **Email Notifications**: Password reset emails via SendGrid
- **PDF Generation**: Invoice generation with PDFKit

### Performance & Monitoring
- **Response Compression**: Gzip compression for better performance
- **Request Logging**: HTTP request logging with Morgan
- **Error Handling**: Comprehensive error handling with custom error pages

## 🛠 Tech Stack

### Backend Framework
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **EJS**: Embedded JavaScript templating engine

### Database
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling library

### Authentication & Security
- **express-session**: Session middleware
- **connect-mongodb-session**: MongoDB session store
- **bcryptjs**: Password hashing library
- **csurf**: CSRF protection middleware
- **helmet**: Security middleware for HTTP headers
- **express-validator**: Input validation and sanitization

### File Handling & Communication
- **multer**: File upload middleware
- **nodemailer**: Email sending library
- **nodemailer-sendgrid-transport**: SendGrid email service integration
- **pdfkit**: PDF generation library

### Payment Processing
- **stripe**: Payment processing platform integration

### Performance & Monitoring
- **compression**: Response compression middleware
- **morgan**: HTTP request logging middleware
- **connect-flash**: Flash message middleware

### Development Tools
- **nodemon**: Development server with auto-restart

## 📁 Project Structure

```
03-setting-up-a-ssl-server/
├── app.js                  # Main application file
├── package.json           # Dependencies and scripts
├── nodemon.json          # Development environment variables
├── README.md             # Project documentation
├── controllers/          # Business logic layer
│   ├── admin.js         # Admin panel functionality
│   ├── auth.js          # Authentication logic
│   ├── error.js         # Error handling
│   └── shop.js          # Shop functionality
├── middleware/           # Custom middleware
│   └── is-auth.js       # Authentication middleware
├── models/              # Database models
│   ├── order.js         # Order model
│   ├── product.js       # Product model
│   └── user.js          # User model
├── routes/              # Route definitions
│   ├── admin.js         # Admin routes
│   ├── auth.js          # Authentication routes
│   └── shop.js          # Shop routes
├── views/               # EJS templates
│   ├── 404.ejs          # 404 error page
│   ├── 500.ejs          # 500 error page
│   ├── admin/           # Admin panel views
│   ├── auth/            # Authentication views
│   ├── includes/        # Reusable template parts
│   └── shop/            # Shop views
├── public/              # Static assets
│   ├── css/             # Stylesheets
│   └── js/              # Client-side JavaScript
├── util/                # Utility functions
│   ├── file.js          # File operations
│   └── path.js          # Path utilities
└── images/              # Uploaded product images (created at runtime)
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Node.js** (version 12.x or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas cloud account)
- **Git** (for cloning the repository)

### Optional
- **SendGrid Account** (for email functionality)
- **Stripe Account** (for payment processing)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd 03-setting-up-a-ssl-server
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies listed in `package.json`.

### 3. Create Required Directories

The application will automatically create the `images` directory for file uploads, but you can create it manually:

```bash
mkdir images
```

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env` file in the root directory or update the `nodemon.json` file with your configuration:

```json
{
    "env": {
        "MONGO_USER": "your-mongodb-username",
        "MONGO_PASSWORD": "your-mongodb-password",
        "MONGO_DEFAULT_DATABASE": "shop",
        "STRIPE_KEY": "your-stripe-secret-key"
    }
}
```

### 2. Database Setup

#### Option A: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and update the environment variables

#### Option B: Local MongoDB
1. Install MongoDB on your local machine
2. Start the MongoDB service
3. Update the `MONGODB_URI` in `app.js` to point to your local instance:
   ```javascript
   const MONGODB_URI = 'mongodb://localhost:27017/shop';
   ```

### 3. Email Configuration (Optional)

Update the SendGrid API key in `controllers/auth.js`:

```javascript
const transporter = nodemailer.createTransporter(
  sendgridTransport({
    auth: {
      api_key: 'your-sendgrid-api-key'
    }
  })
);
```

### 4. Payment Configuration (Optional)

Update your Stripe secret key in the environment variables and ensure it matches in `controllers/shop.js`.

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run start:dev
```

This starts the application with nodemon, which automatically restarts the server when files change.

### Production Mode

```bash
npm start
```

This starts the application in production mode with all environment variables set.

### Alternative Start

```bash
npm run start-server
```

This starts the application without environment variables (useful for testing).

### Access the Application

Open your web browser and navigate to:
- **HTTP**: `http://localhost:3000`
- **HTTPS**: `https://localhost:3000` (if SSL is configured)

## 🔒 SSL Setup

The application is configured to support HTTPS but requires SSL certificates.

### 1. Generate Self-Signed Certificates (Development)

```bash
# Generate private key
openssl genrsa -out server.key 2048

# Generate certificate signing request
openssl req -new -key server.key -out server.csr

# Generate self-signed certificate
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert
```

### 2. Enable HTTPS

Uncomment the HTTPS server code in `app.js`:

```javascript
// Connect to MongoDB and start the server
mongoose
  .connect(MONGODB_URI)
  .then(result => {
    // HTTPS server
    https
      .createServer({ key: privateKey, cert: certificate }, app)
      .listen(process.env.PORT || 3000);
    
    // Comment out or remove the HTTP server
    // app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });
```

### 3. Production SSL

For production, use certificates from a trusted Certificate Authority like Let's Encrypt.

## 🔌 API Endpoints

### Public Routes
- `GET /` - Home page with featured products
- `GET /products` - Product listing with pagination
- `GET /products/:productId` - Product details
- `GET /login` - Login form
- `GET /signup` - Registration form

### Protected Routes (Authentication Required)
- `GET /cart` - View shopping cart
- `POST /cart` - Add item to cart
- `POST /cart-delete-item` - Remove item from cart
- `GET /checkout` - Checkout page
- `GET /orders` - Order history
- `GET /orders/:orderId` - Download invoice
- `POST /logout` - User logout

### Admin Routes (Authentication Required)
- `GET /admin/products` - Manage products
- `GET /admin/add-product` - Add product form
- `POST /admin/add-product` - Create new product
- `GET /admin/edit-product/:productId` - Edit product form
- `POST /admin/edit-product` - Update product
- `DELETE /admin/product/:productId` - Delete product

### Authentication Routes
- `POST /login` - User login
- `POST /signup` - User registration
- `GET /reset` - Password reset form
- `POST /reset` - Send password reset email
- `GET /reset/:token` - New password form
- `POST /new-password` - Set new password

## 💻 Usage

### For Customers

1. **Browse Products**: Visit the home page to see featured products
2. **Create Account**: Register with email and password
3. **Add to Cart**: Browse products and add items to your cart
4. **Checkout**: Review cart and proceed to payment
5. **View Orders**: Check your order history and download invoices

### For Administrators

1. **Login**: Use admin credentials to access admin panel
2. **Manage Products**: Add, edit, or delete products
3. **Upload Images**: Add product images during product creation
4. **View Orders**: Monitor customer orders (if admin panel includes this feature)

### Development Features

- **Error Pages**: Custom 404 and 500 error pages
- **Flash Messages**: User feedback for actions (success/error messages)
- **Mobile Responsive**: Works on desktop and mobile devices
- **CSRF Protection**: All forms include CSRF tokens
- **Input Validation**: Server-side validation with helpful error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Maximilian Schwarzmüller**

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- MongoDB team for the database solution
- Stripe for payment processing capabilities
- All contributors to the open-source packages used in this project

---

**Note**: This project is part of a Node.js learning course and demonstrates best practices for building production-ready web applications with Node.js and Express.
