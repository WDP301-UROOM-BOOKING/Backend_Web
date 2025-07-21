const express = require('express');
const router = express.Router();
const promotionController = require('./PromotionController');
const checkCustomer = require('../../middlewares/checkCustomer');
const { isAdmin } = require('../../middlewares/checkAdmin');
const optionalAuth = require('../../middlewares/optionalAuth');

// Create promotion (Admin only)
router.post('/', isAdmin, promotionController.createPromotion);

// Get all promotions (Admin or Customer) - with optional user info
router.get('/', optionalAuth, promotionController.getAllPromotions);

// Get single promotion by ID (Admin or Customer)
router.get('/:id', promotionController.getPromotionById);

// Update promotion (Admin only)
router.put('/:id', isAdmin, promotionController.updatePromotion);

// Delete promotion (Admin only)
router.delete('/:id', isAdmin, promotionController.deletePromotion);

// Toggle promotion status (Admin only)
router.patch('/:id/status', isAdmin, promotionController.togglePromotionStatus);

// Apply promotion (Customer only)
router.post('/apply', checkCustomer, promotionController.applyPromotionCode);

module.exports = router;
