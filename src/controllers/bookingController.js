const BookingModel = require('../models/BookingModel');
const ServiceModel = require('../models/ServiceModel');

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

// GET /bookings/new - Display booking form with selected services
exports.getBookingPage = async (req, res, next) => {
    let { selected_services } = req.query;
    if (!selected_services) {
        setFlashMessage(req, 'error', 'Please select at least one service to book.');
        return res.redirect('/services');
    }

    // Ensure selected_services is an array
    if (!Array.isArray(selected_services)) {
        selected_services = [selected_services];
    }
    // Filter out any empty strings or invalid values if any
    selected_services = selected_services.map(id => parseInt(id, 10)).filter(id => !isNaN(id) && id > 0);


    if (selected_services.length === 0) {
        setFlashMessage(req, 'error', 'No valid services selected.');
        return res.redirect('/services');
    }
    
    try {
        const servicesDetails = await ServiceModel.findByIds(selected_services);
        if (servicesDetails.length !== selected_services.length) {
            setFlashMessage(req, 'error', 'Some selected services could not be found. Please try again.');
            return res.redirect('/services');
        }

        let totalPrice = 0;
        let totalEstimatedTime = 0;
        let requiresMobileAddress = false;
        servicesDetails.forEach(service => {
            totalPrice += service.price;
            totalEstimatedTime += service.estimated_time_minutes || 0;
            if (service.is_mobile_service_option) {
                requiresMobileAddress = true; // If any service can be mobile, we might need address
            }
        });
        
        res.render('layouts/main-layout', {
            title: 'Book Services',
            view: 'booking/booking-form', // Path to booking/booking-form.ejs
            selectedServices: servicesDetails,
            totalPrice: totalPrice.toFixed(2),
            totalEstimatedTime,
            requiresMobileAddress, // To conditionally show address field
            formData: {}, // For repopulating form on error
            errors: {}
        });
    } catch (error) {
        console.error("Error preparing booking page:", error);
        next(error);
    }
};

// POST /bookings - Create a new booking
exports.createBooking = async (req, res, next) => {
    const { service_ids, booking_date, booking_time, notes, mobile_service_address } = req.body;
    const user_id = req.session.user.id; // Assuming user is logged in (use isAuthenticated middleware)

    // Ensure service_ids is an array
    let serviceIdsArray = service_ids;
    if (service_ids && !Array.isArray(service_ids)) {
        serviceIdsArray = [service_ids];
    }
    serviceIdsArray = serviceIdsArray.map(id => parseInt(id, 10));


    if (!serviceIdsArray || serviceIdsArray.length === 0 || !booking_date || !booking_time) {
        setFlashMessage(req, 'error', 'Services, date, and time are required for booking.');
        // Need to re-fetch service details if redirecting back to form with errors
        // This part can be complex, consider client-side handling or re-querying
        return res.redirect(req.headers.referer || '/services'); // Redirect back
    }

    try {
        const bookingDetails = await BookingModel.createBooking({
            user_id,
            service_ids: serviceIdsArray,
            booking_date,
            booking_time,
            notes,
            mobile_service_address
        });
        
        // Mock email notification
        console.log(`Booking Confirmation (mock email): Booking ID ${bookingDetails.id} for ${req.session.user.email} on ${booking_date} at ${booking_time}.`);

        setFlashMessage(req, 'success', `Booking successful! Your Booking ID is ${bookingDetails.id}.`);
        res.redirect(`/bookings/${bookingDetails.id}`); // Redirect to booking confirmation/details page
    } catch (error) {
        console.error("Error creating booking:", error);
        setFlashMessage(req, 'error', error.message || 'Failed to create booking. Please try again.');
        // Redirect back to the form, ideally with form data and errors repopulated
        // This requires passing selected_services back or storing them in session temporarily
        const queryParams = serviceIdsArray.map(id => `selected_services=${id}`).join('&');
        res.redirect(`/bookings/new?${queryParams}`);
    }
};

// GET /bookings/my-bookings - Display user's booking history
exports.getUserBookings = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const bookings = await BookingModel.findByUserId(userId);
        res.render('layouts/main-layout', {
            title: 'My Bookings',
            view: 'booking/my-bookings', // Path to booking/my-bookings.ejs
            bookings
        });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        next(error);
    }
};

// GET /bookings/:id - Display details of a specific booking
exports.getBookingDetails = async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        const userId = req.session.user.id; // For authorization
        const booking = await BookingModel.findById(bookingId);

        console.log(`Fetching booking details for ID: ${bookingId}. Found booking:`, booking);

        if (!booking) {
            setFlashMessage(req, 'error', 'Booking not found.');
            return res.redirect('/bookings/my-bookings');
        }
        // Authorization: Ensure the logged-in user owns this booking (or is admin)
        if (booking.user_id !== userId /* && !req.session.user.isAdmin */) {
            setFlashMessage(req, 'error', 'You are not authorized to view this booking.');
            return res.redirect('/bookings/my-bookings');
        }
        
        res.render('layouts/main-layout', {
            title: `Booking Details - #${booking.id}`,
            view: 'booking/booking-detail', // Path to booking/booking-detail.ejs
            booking
        });
    } catch (error) {
        console.error("Error fetching booking details:", error);
        next(error);
    }
};

// POST /bookings/:id/cancel - Cancel a booking (User)
exports.cancelBooking = async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        const userId = req.session.user.id; // Assuming user is logged in

        console.log(`Attempting to cancel booking ID: ${bookingId} for user ID: ${userId}`);

        // Implement logic in BookingModel to update status
        const success = await BookingModel.cancelBooking(bookingId, userId);

        if (success) {
            console.log(`Booking ID: ${bookingId} cancelled successfully.`);
            res.json({ success: true, message: 'Booking cancelled successfully.' });
        } else {
            // This might happen if booking not found, not owned by user, or already cancelled/completed
            console.warn(`Failed to cancel booking ID: ${bookingId} for user ID: ${userId}. Booking not found, not owned, or not in cancellable state.`);
            res.status(400).json({ success: false, message: 'Failed to cancel booking. It may not exist, belong to you, or be in a state that cannot be cancelled.' });
        }
    } catch (error) {
        console.error(`Error cancelling booking ID: ${req.params.id} for user ID: ${req.session.user.id}:`, error);
        res.status(500).json({ success: false, message: 'An error occurred while cancelling the booking.' });
    }
};

// DELETE /bookings/:id - Delete a booking (User)
exports.deleteBooking = async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        const userId = req.session.user.id; // Assuming user is logged in

        console.log(`Attempting to delete booking ID: ${bookingId} for user ID: ${userId}`);

        // Implement logic in BookingModel to delete booking
        const success = await BookingModel.deleteBooking(bookingId, userId);

        if (success) {
            console.log(`Booking ID: ${bookingId} deleted successfully.`);
            res.json({ success: true, message: 'Booking deleted successfully.' });
        } else {
            // This might happen if booking not found or not owned by user
            console.warn(`Failed to delete booking ID: ${bookingId} for user ID: ${userId}. Booking not found or not owned.`);
            res.status(400).json({ success: false, message: 'Failed to delete booking. It may not exist or belong to you.' });
        }
    } catch (error) {
        console.error(`Error deleting booking ID: ${req.params.id} for user ID: ${req.session.user.id}:`, error);
        res.status(500).json({ success: false, message: 'An error occurred while deleting the booking.' });
    }
};


// --- Admin functionalities (placeholders) ---
// GET /bookings/admin - List all bookings (Admin)
// exports.listAllBookings = async (req, res, next) => { ... }

// POST /bookings/admin/:id/status - Update booking status (Admin)
// exports.updateBookingStatus = async (req, res, next) => { ... }
