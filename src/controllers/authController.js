const UserModel = require('../models/UserModel');
const crypto = require('crypto'); // For potential token generation

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

exports.getRegisterPage = (req, res) => {
    res.render('layouts/main-layout', {
        title: 'Register',
        view: 'auth/register',
        formData: {}, // For repopulating form on error
        errors: {}    // For displaying validation errors
    });
};

exports.registerUser = async (req, res) => {
    const { name, email, password, confirm_password, address, phone_number } = req.body;
    let errors = {};

    if (!name || !email || !password || !confirm_password) {
        setFlashMessage(req, 'error', 'Name, email, password, and confirm password are required.');
        return res.redirect('/auth/register'); // Or render with errors
    }
    if (password !== confirm_password) {
        setFlashMessage(req, 'error', 'Passwords do not match.');
        return res.redirect('/auth/register'); // Or render with errors
    }
    if (password.length < 6) { // Basic password length validation
        setFlashMessage(req, 'error', 'Password must be at least 6 characters long.');
        return res.redirect('/auth/register');
    }

    try {
        const newUser = await UserModel.createUser({ name, email, password, address, phone_number });
        // TODO: Implement email verification step if desired
        // For now, log user in directly or redirect to login
        setFlashMessage(req, 'success', 'Registration successful! Please log in.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error.message);
        setFlashMessage(req, 'error', error.message || 'Registration failed. Please try again.');
        // It's better to render the page with errors and form data
        res.render('layouts/main-layout', {
            title: 'Register',
            view: 'auth/register',
            formData: { name, email, address, phone_number }, // Don't repopulate passwords
            errors: { general: error.message || 'Registration failed.' }
        });
    }
};

exports.getLoginPage = (req, res) => {
    let pageMessages = {};
    if (req.query.status === 'logged_out') {
        pageMessages.success = ['You have been successfully logged out.'];
    }
    // You can add other query param status checks here if needed

    res.render('layouts/main-layout', {
        title: 'Login',
        view: 'auth/login',
        formData: {},
        errors: {},
        pageMessages // Pass messages to the template
    });
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for:', email); // Debug log
    
    if (!email || !password) {
        console.log('Missing email or password'); // Debug log
        setFlashMessage(req, 'error', 'Email and password are required.');
        return res.redirect('/auth/login');
    }

    try {
        const user = await UserModel.findByEmail(email);
        console.log('User found:', user ? 'Yes' : 'No'); // Debug log
        
        if (!user) {
            console.log('User not found for email:', email); // Debug log
            setFlashMessage(req, 'error', 'Invalid email or password.');
            return res.redirect('/auth/login');
        }

        const isMatch = await UserModel.comparePassword(password, user.password_hash);
        console.log('Password match:', isMatch); // Debug log
        
        if (!isMatch) {
            console.log('Password does not match for:', email); // Debug log
            setFlashMessage(req, 'error', 'Invalid email or password.');
            return res.redirect('/auth/login');
        }

        // TODO: Implement email verification check if desired
        // if (!user.email_verified_at) {
        //     setFlashMessage(req, 'error', 'Please verify your email before logging in.');
        //     return res.redirect('/auth/login');
        // }

        // Set up session
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
            // Add other non-sensitive info if needed
        };
        req.session.isAuthenticated = true;

        console.log('Login successful for:', email); // Debug log
        setFlashMessage(req, 'success', 'Logged in successfully!');
        res.redirect('/user/profile'); // Or to a dashboard page

    } catch (error) {
        console.error('Login error:', error.message);
        setFlashMessage(req, 'error', 'Login failed. Please try again.');
        res.redirect('/auth/login');
    }
};

exports.logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            // Cannot use session flash messages here as session is being destroyed
            // Redirect with a generic error or to an error page if critical
            return res.redirect('/?logout_error=true'); 
        }
        res.clearCookie('connect.sid'); // Default session cookie name
        // Redirect with a success query parameter instead of session flash
        res.redirect('/auth/login?status=logged_out');
    });
};


// --- Password Reset Placeholders ---
exports.getForgotPasswordPage = (req, res) => {
    res.render('layouts/main-layout', { title: 'Forgot Password', view: 'auth/forgot-password', errors: {}, formData: {} });
};

exports.handleForgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await UserModel.findByEmail(email);
        if (!user) {
            setFlashMessage(req, 'info', 'If an account with that email exists, a password reset link has been sent.');
            return res.redirect('/auth/forgot-password');
        }
        const resetToken = await UserModel.setPasswordResetToken(email);
        // In a real app, send an email with this token
        console.log(`Password Reset Token for ${email}: ${resetToken}`); // Mock email sending
        setFlashMessage(req, 'success', 'Password reset instructions have been (mock) sent to your email.');
        res.redirect('/auth/forgot-password');
    } catch (error) {
        console.error("Forgot password error:", error);
        setFlashMessage(req, 'error', 'Error processing request. Try again.');
        res.redirect('/auth/forgot-password');
    }
};

exports.getResetPasswordPage = (req, res) => {
    const { token } = req.params;
    // Here you might want to verify the token is somewhat valid before rendering
    // For simplicity, just rendering the page
    res.render('layouts/main-layout', { title: 'Reset Password', view: 'auth/reset-password', token, errors: {}, formData: {} });
};

exports.handleResetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirm_password } = req.body;

    if (!password || !confirm_password || password !== confirm_password) {
        setFlashMessage(req, 'error', 'Passwords do not match or are missing.');
        return res.redirect(`/auth/reset-password/${token}`);
    }
     if (password.length < 6) {
        setFlashMessage(req, 'error', 'Password must be at least 6 characters long.');
        return res.redirect(`/auth/reset-password/${token}`);
    }

    try {
        await UserModel.resetPassword(token, password);
        setFlashMessage(req, 'success', 'Your password has been reset successfully. Please log in.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error("Reset password error:", error);
        setFlashMessage(req, 'error', error.message || 'Failed to reset password. The link may be invalid or expired.');
        res.redirect(`/auth/reset-password/${token}`);
    }
};
