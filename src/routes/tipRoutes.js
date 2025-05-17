const express = require('express');
const router = express.Router();
const tipController = require('../controllers/tipController');
// const { isAdmin } = require('../middlewares/authMiddleware'); // For admin actions

// GET /tips - Public list of all maintenance tips
router.get('/', tipController.listTips);

// GET /tips/:id - Public view of a single tip's details (optional)
// router.get('/:id', tipController.getTipDetails);


// --- Admin Routes (example) ---
// router.get('/admin/new', isAdmin, tipController.getCreateTipForm);
// router.post('/admin', isAdmin, tipController.createTip);
// router.get('/admin/:id/edit', isAdmin, tipController.getEditTipForm);
// router.post('/admin/:id', isAdmin, tipController.updateTip);
// router.post('/admin/:id/delete', isAdmin, tipController.deleteTip);

module.exports = router;
