const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/authMiddleware'); // Protect user routes

// GET /user/profile - Display user profile page
router.get('/profile', isAuthenticated, userController.getUserProfile);

// POST /user/profile - Handle update of user profile information
router.post('/profile', isAuthenticated, userController.updateUserProfile);

// Optional: Routes for changing password from profile page
// router.get('/profile/change-password', isAuthenticated, userController.getChangePasswordPage);
// router.post('/profile/change-password', isAuthenticated, userController.handleChangePassword);

module.exports = router;
