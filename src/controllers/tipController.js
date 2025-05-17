const TipModel = require('../models/TipModel');

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

// GET /tips - Display list of all tips
exports.listTips = async (req, res, next) => {
    try {
        const tips = await TipModel.getAllTips();
        res.render('layouts/main-layout', {
            title: 'Maintenance Tips',
            view: 'tips/tip-list', // Path to tips/tip-list.ejs
            tips
        });
    } catch (error) {
        console.error("Error fetching tips for listing:", error);
        setFlashMessage(req, 'error', 'Could not load maintenance tips. Please try again later.');
        next(error); // Pass to global error handler
    }
};

// GET /tips/:id - Display details of a single tip (optional, if needed for a dedicated page)
// exports.getTipDetails = async (req, res, next) => { ... }


// --- Admin functionalities (placeholders, would need admin auth middleware) ---
// exports.getCreateTipForm = (req, res) => { ... }
// exports.createTip = async (req, res) => { ... }
// exports.getEditTipForm = async (req, res) => { ... }
// exports.updateTip = async (req, res) => { ... }
// exports.deleteTip = async (req, res) => { ... }
