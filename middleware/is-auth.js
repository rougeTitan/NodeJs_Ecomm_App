// Authentication middleware to protect routes
// This middleware checks if a user is logged in before allowing access to protected routes
module.exports = (req, res, next) => {
    // Check if user session indicates they are logged in
    if (!req.session.isLoggedIn) {
        // User not authenticated, redirect to login page
        return res.redirect('/login');
    }
    // User is authenticated, continue to next middleware/route handler
    next();
}