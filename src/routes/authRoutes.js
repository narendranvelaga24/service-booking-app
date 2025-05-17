const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Middleware to prevent logged-in users from accessing auth pages like login/register
function guestOnly(req, res, next) {
    if (req.session.isAuthenticated) {
        return res.redirect('/user/profile'); // Or dashboard
    }
    next();
}

// GET /auth/register - Display registration page
router.get('/register', guestOnly, authController.getRegisterPage);

// POST /auth/register - Handle user registration
router.post('/register', guestOnly, authController.registerUser);

// GET /auth/login - Display login page
router.get('/login', guestOnly, authController.getLoginPage);

// POST /auth/login - Handle user login
router.post('/login', guestOnly, authController.loginUser);

// POST /auth/logout - Handle user logout
router.post('/logout', (req, res, next) => { // Ensure logout is protected if needed, but generally accessible
    if (!req.session.isAuthenticated) {
        // If somehow a non-authenticated user tries to POST to logout
        return res.redirect('/auth/login'); 
    }
    next();
}, authController.logoutUser);


// Password Reset Routes
// GET /auth/forgot-password - Display forgot password form
router.get('/forgot-password', guestOnly, authController.getForgotPasswordPage);

// POST /auth/forgot-password - Handle forgot password request
router.post('/forgot-password', guestOnly, authController.handleForgotPassword);

// GET /auth/reset-password/:token - Display reset password form
router.get('/reset-password/:token', guestOnly, authController.getResetPasswordPage);

// POST /auth/reset-password/:token - Handle password reset
router.post('/reset-password/:token', guestOnly, authController.handleResetPassword);


// TODO: Email verification routes if implemented
// router.get('/verify-email/:token', authController.verifyEmail);

module.exports = router;
