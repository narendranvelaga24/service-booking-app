const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { isAuthenticated } = require('../middlewares/authMiddleware'); // Ensure user is logged in for booking actions

// GET /bookings/new - Display the booking form (requires selected services as query params)
// This route must be protected to ensure a user is logged in
router.get('/new', isAuthenticated, bookingController.getBookingPage);

// POST /bookings - Create a new booking
// This route must be protected
router.post('/', isAuthenticated, bookingController.createBooking);

// GET /bookings/my-bookings - Display the current user's booking history
// This route must be protected
router.get('/my-bookings', isAuthenticated, bookingController.getUserBookings);

// GET /bookings/:id - Display details of a specific booking
// This route must be protected, and controller should verify ownership or admin status
router.get('/:id', isAuthenticated, bookingController.getBookingDetails);

// POST /bookings/:id/cancel - Cancel a booking (User action)
// This route must be protected
router.post('/:id/cancel', isAuthenticated, bookingController.cancelBooking);

// DELETE /bookings/:id - Delete a booking (User action)
// This route must be protected
router.delete('/:id', isAuthenticated, bookingController.deleteBooking);


// --- Admin Routes (example, would require isAdmin middleware from authMiddleware) ---
// const { isAdmin } = require('../middlewares/authMiddleware');
// router.get('/admin', isAuthenticated, isAdmin, bookingController.listAllBookings);
// router.post('/admin/:id/status', isAuthenticated, isAdmin, bookingController.updateBookingStatus);

module.exports = router;
