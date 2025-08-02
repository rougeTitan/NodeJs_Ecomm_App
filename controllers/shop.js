// Import required modules
const fs = require('fs'); // File system operations
const path = require('path'); // File path utilities

const PDFDocument = require('pdfkit'); // PDF generation library
const stripe = require('stripe')(process.env.STRIPE_KEY); // Stripe payment processing

// Import models
const Product = require('../models/product'); // Product model
const Order = require('../models/order'); // Order model

// Configuration for pagination
const ITEMS_PER_PAGE = 2; // Number of products to display per page

// Controller function to get products with pagination
exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1; // Get page number from query string, default to 1
  let totalItems;

  // First, count total number of products for pagination calculations
  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      // Get products for current page using skip and limit
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE) // Skip products from previous pages
        .limit(ITEMS_PER_PAGE); // Limit to items per page
    })
    .then(products => {
      // Render product list view with pagination data
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      // Handle errors by creating an error object and passing to next middleware
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Controller function to get individual product details
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId; // Extract product ID from URL parameters
  // Find product by ID in database
  Product.findById(prodId)
    .then(product => {
      // Render product detail view with product data
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products' // Current path for navigation highlighting
      });
    })
    .catch(err => {
      // Handle errors by creating an error object and passing to next middleware
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Controller function to get home page/index with featured products
exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1; // Get page number from query string, default to 1
  let totalItems;

  // Count total products for pagination
  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      // Get products for current page
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      // Render home page with featured products and pagination
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      // Handle errors
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Controller function to display user's shopping cart
exports.getCart = (req, res, next) => {
  // Populate cart items with full product details from database
  req.user
    .populate('cart.items.productId') // Replace product IDs with full product objects
    .execPopulate()
    .then(user => {
      const products = user.cart.items; // Extract cart items with populated product data
      // Render cart view with user's cart items
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => {
      // Handle errors
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Controller function to add product to cart
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId; // Get product ID from form submission
  // Find the product to add to cart
  Product.findById(prodId)
    .then(product => {
      // Use the user model's addToCart method to add product
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result); // Log success for debugging
      res.redirect('/cart'); // Redirect back to cart page
    })
    .catch(err => {
      // Handle errors
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Controller function to remove product from cart
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId; // Get product ID to remove
  // Use the user model's removeFromCart method
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express
  let totalSum = 0;

  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {  
      user.cart.items.forEach(p => {
        totalSum += p.quantity * p.productId.price;
      });

      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      const charge = stripe.charges.create({
        amount: totalSum * 100,
        currency: 'usd',
        description: 'Demo Order',
        source: token,
        metadata: { order_id: result._id.toString() }
      });
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('-----------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              ' - ' +
              prod.quantity +
              ' x ' +
              '$' +
              prod.product.price
          );
      });
      pdfDoc.text('---');
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch(err => next(err));
};
