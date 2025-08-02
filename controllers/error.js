// Controller function to handle 404 (Page Not Found) errors
exports.get404 = (req, res, next) => {
  // Set HTTP status to 404 and render the 404 error page
  res.status(404).render('404', {
    pageTitle: 'Page Not Found',
    path: '/404', // Current path for navigation
    isAuthenticated: req.session.isLoggedIn // Pass authentication status to view
  });
};

// Controller function to handle 500 (Internal Server Error) errors
exports.get500 = (req, res, next) => {
  // Set HTTP status to 500 and render the 500 error page
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500', // Current path for navigation
    isAuthenticated: req.session.isLoggedIn // Pass authentication status to view
  });
};
