const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
// const { isAdmin, isAuthenticated } = require('../middlewares/authMiddleware'); // To be created

// GET /services - Public list of all services
router.get('/', serviceController.listServices);

// GET /services/:id - Public view of a single service's details
router.get('/:id', serviceController.getServiceDetails);


// --- Admin Routes (example, would require isAdmin middleware) ---
// router.get('/admin/new', isAdmin, serviceController.getCreateServiceForm);
// router.post('/admin', isAdmin, serviceController.createService);
// router.get('/admin/:id/edit', isAdmin, serviceController.getEditServiceForm);
// router.post('/admin/:id', isAdmin, serviceController.updateService);
// router.post('/admin/:id/delete', isAdmin, serviceController.deleteService);

module.exports = router;
