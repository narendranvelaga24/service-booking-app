const UserModel = require('../models/UserModel');

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

// GET /user/profile - Display user profile page
exports.getUserProfile = async (req, res, next) => {
    try {
        // User data is already in req.session.user, but we might want to fetch fresh data
        // or more detailed data not stored in session.
        const user = await UserModel.findById(req.session.user.id);
        if (!user) {
            setFlashMessage(req, 'error', 'User profile not found. Please log in again.');
            // Destroy session and redirect to login if user from session doesn't exist in DB
            return req.session.destroy(() => res.redirect('/auth/login'));
        }
        
        res.render('layouts/main-layout', {
            title: 'My Profile',
            view: 'user/profile', // Path to user/profile.ejs
            userProfile: user, // Pass the fetched user profile data
            formData: user, // For pre-filling edit form
            errors: {}
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        next(error);
    }
};

// POST /user/profile - Handle update of user profile information
exports.updateUserProfile = async (req, res, next) => {
    const userId = req.session.user.id;
    const { name, email, address, phone_number } = req.body;

    // Basic validation
    if (!name || !email) {
        setFlashMessage(req, 'error', 'Name and Email are required.');
        // It's better to re-render the profile page with errors and existing data
        // This requires fetching the user data again or passing it through session/locals
        const user = await UserModel.findById(userId); // Re-fetch for consistency
        return res.render('layouts/main-layout', {
            title: 'My Profile',
            view: 'user/profile',
            userProfile: user,
            formData: { name, email, address, phone_number }, // Use submitted data for repopulation
            errors: { general: 'Name and Email are required.' }
        });
    }

    try {
        await UserModel.updateUserProfile(userId, { name, email, address, phone_number });
        
        // Update session with new details if they changed
        req.session.user.name = name;
        req.session.user.email = email; 
        // Note: If email is a login credential, changing it might need re-verification or other checks.

        setFlashMessage(req, 'success', 'Profile updated successfully.');
        res.redirect('/user/profile');
    } catch (error) {
        console.error("Error updating user profile:", error);
        setFlashMessage(req, 'error', error.message || 'Failed to update profile. Please try again.');
        const user = await UserModel.findById(userId); // Re-fetch for consistency
        res.render('layouts/main-layout', {
            title: 'My Profile',
            view: 'user/profile',
            userProfile: user,
            formData: { name, email, address, phone_number }, // Use submitted data
            errors: { general: error.message || 'Failed to update profile.' }
        });
    }
};

// GET /user/profile/change-password - Display change password form (Optional)
// exports.getChangePasswordPage = (req, res) => { ... }

// POST /user/profile/change-password - Handle password change (Optional)
// exports.handleChangePassword = async (req, res) => { ... }
