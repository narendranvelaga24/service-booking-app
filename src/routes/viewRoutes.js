const express = require('express');
const router = express.Router();

// GET / - Home page
router.get('/', (req, res) => {
    res.render('layouts/main-layout', {
        title: 'Welcome - Service Booking App',
        view: 'home', // Path to home.ejs relative to views folder
        // Any other data needed for the home page can be passed here
    });
});

const TeamMemberModel = require('../models/TeamMemberModel'); // Import TeamMemberModel

// Example: About Us page (static content for now)
router.get('/about', async (req, res, next) => {
    try {
        const teamMembers = await TeamMemberModel.getAllTeamMembers();
        res.render('layouts/main-layout', {
            title: 'About Us - Service Booking App',
            view: 'about', // Assumes views/about.ejs exists
            teamMembers
        });
    } catch (error) {
        console.error("Error fetching team members for About Us page:", error);
        // Render the page without team members or pass to error handler
        // For simplicity, rendering without team members on error
        res.render('layouts/main-layout', {
            title: 'About Us - Service Booking App',
            view: 'about',
            teamMembers: [] // Pass empty array on error
        });
    }
});

// Example: Contact page (static content for now)
router.get('/contact', (req, res) => {
    res.render('layouts/main-layout', {
        title: 'Contact Us - Service Booking App',
        view: 'contact', // Assumes views/contact.ejs exists
    });
});

// Example: Privacy Policy page (static content for now)
router.get('/privacy', (req, res) => {
    // formatDateDDMMYYYY is not needed here if we use toLocaleDateString directly in the template for the current date
    res.render('layouts/main-layout', {
        title: 'Privacy Policy - Service Booking App',
        view: 'privacy' // Assumes views/privacy.ejs exists
    });
});


module.exports = router;
