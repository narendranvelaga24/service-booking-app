require('dotenv').config(); // For environment variables
const express = require('express');
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { initializeDB } = require('./config/database');

// Import routers (we'll create these soon)
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const tipRoutes = require('./routes/tipRoutes'); // Import tip routes
const viewRoutes = require('./routes/viewRoutes'); // For general page views like home

const app = express();
const PORT = process.env.PORT || 8080; // Use a different port than the previous project

// View engine setup
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, '..', 'public'))); // Serve static files

// Session setup
const sessionDir = process.env.RAILWAY_VOLUME_MOUNT_PATH 
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'database')
    : require('fs').existsSync('/app/data') // Check if Railway volume exists
    ? path.join('/app/data', 'database')
    : path.join(__dirname, '..', 'database');

app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db', // Database file for sessions
        dir: sessionDir, // Use the same persistent directory as main database
        table: 'sessions'
    }),
    secret: process.env.SESSION_SECRET || 'your_very_secret_key_here_change_it', // Change this in .env
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Temporarily disable secure cookies to test
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Middleware to make session and user available in templates
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.currentUser = req.session.user; // Assuming user info is stored in req.session.user upon login
    res.locals.flashMessages = req.session.flashMessages; // For flash messages
    delete req.session.flashMessages; // Clear flash messages after displaying
    next();
});


// Initialize Database
initializeDB()
    .then(() => {
        console.log('Database initialized successfully for the app.');

        // Routes
        app.use('/', viewRoutes); // General page views (home, etc.)
        app.use('/auth', authRoutes);
        app.use('/services', serviceRoutes);
        app.use('/bookings', bookingRoutes);
        app.use('/user', userRoutes);
        app.use('/tips', tipRoutes); // Use tip routes

        // 404 Handler
        app.use((req, res, next) => {
            res.status(404).render('layouts/main-layout', { 
                title: 'Page Not Found', 
                view: '404', // Path to 404.ejs relative to views folder
                error: { message: 'Sorry, the page you are looking for does not exist.' }
            });
        });

        // Global Error Handler
        app.use((err, req, res, next) => {
            console.error("Global Error Handler:", err.stack);
            res.status(err.status || 500).render('layouts/main-layout', {
                title: 'Error',
                view: 'error', // Path to error.ejs relative to views folder
                error: {
                    message: err.message || 'Something went wrong on our server.',
                    status: err.status || 500
                }
            });
        });

        app.listen(PORT, () => {
            console.log(`Service Booking App server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to initialize database or start server:', err);
        process.exit(1);
    });

module.exports = app; // For potential testing
