// Helper for flash messages
function setFlashMessage(req, type, message) {
    if (!req.session.flashMessages) {
        req.session.flashMessages = {};
    }
    if (!req.session.flashMessages[type]) {
        req.session.flashMessages[type] = [];
    }
    req.session.flashMessages[type].push(message);
}

// Middleware to check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated && req.session.user) {
        return next();
    }
    setFlashMessage(req, 'error', 'You must be logged in to access this page.');
    res.redirect('/auth/login');
};

// Middleware to check if user is an admin (placeholder)
// This would require a 'role' field in the user model and session
exports.isAdmin = (req, res, next) => {
    if (req.session.isAuthenticated && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    setFlashMessage(req, 'error', 'You do not have permission to access this page.');
    // Redirect to a non-admin page or show an unauthorized error
    if (req.session.isAuthenticated) {
        res.redirect('/'); // Or a user dashboard
    } else {
        res.redirect('/auth/login');
    }
};

// Middleware to prevent logged-in users from accessing certain pages (e.g., login, register)
// This is already in authRoutes.js, but can be centralized here if preferred.
// exports.guestOnly = (req, res, next) => { ... }
