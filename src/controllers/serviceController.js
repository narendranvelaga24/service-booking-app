const ServiceModel = require('../models/ServiceModel');

// Helper for flash messages (can be moved to a utility file later)
function setFlashMessage(req, type, message) {
    if (!req.session.flashMessages) {
        req.session.flashMessages = {};
    }
    if (!req.session.flashMessages[type]) {
        req.session.flashMessages[type] = [];
    }
    req.session.flashMessages[type].push(message);
}

// GET /services - Display list of all services
exports.listServices = async (req, res, next) => {
    try {
        const services = await ServiceModel.getAllServices();
        // Group services by category for better display
        const servicesByCategory = services.reduce((acc, service) => {
            const category = service.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(service);
            return acc;
        }, {});

        res.render('layouts/main-layout', {
            title: 'Our Services',
            view: 'services/service-list', // Path to services/service-list.ejs
            servicesByCategory,
            services // Also pass flat list if needed by template
        });
    } catch (error) {
        console.error("Error fetching services for listing:", error);
        setFlashMessage(req, 'error', 'Could not load services. Please try again later.');
        // Render the page with an error or redirect, or pass to global error handler
        next(error); // Pass to global error handler
    }
};

// GET /services/:id - Display details of a single service (optional, if needed)
exports.getServiceDetails = async (req, res, next) => {
    try {
        const serviceId = req.params.id;
        const service = await ServiceModel.findById(serviceId);
        if (!service) {
            setFlashMessage(req, 'error', 'Service not found.');
            return res.redirect('/services');
        }
        res.render('layouts/main-layout', {
            title: service.name,
            view: 'services/service-detail', // Path to services/service-detail.ejs
            service
        });
    } catch (error) {
        console.error("Error fetching service details:", error);
        next(error);
    }
};


// --- Admin functionalities (placeholders, would need admin auth middleware) ---

// GET /services/admin/new - Display form to create a new service (Admin)
// exports.getCreateServiceForm = (req, res) => { ... }

// POST /services/admin - Handle creation of a new service (Admin)
// exports.createService = async (req, res) => { ... }

// GET /services/admin/:id/edit - Display form to edit a service (Admin)
// exports.getEditServiceForm = async (req, res) => { ... }

// POST /services/admin/:id - Handle update of a service (Admin)
// exports.updateService = async (req, res) => { ... }

// POST /services/admin/:id/delete - Handle deletion of a service (Admin)
// exports.deleteService = async (req, res) => { ... }
