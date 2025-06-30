const express = require('express');
const router = express.Router();
const promotionController = require('./PromotionController');
const checkCustomer = require('../../middlewares/checkCustomer');
const { isAdmin } = require('../../middlewares/checkAdmin');

// Create promotion (Admin only)
router.post('/', isAdmin, promotionController.createPromotion);

// Get all promotions (Admin or Customer)
router.get('/', promotionController.getAllPromotions);

// Get single promotion by ID (Admin or Customer)
router.get('/:id', promotionController.getPromotionById);

// Update promotion (Admin only)
router.put('/:id', isAdmin, promotionController.updatePromotion);

// Delete promotion (Admin only)
router.delete('/:id', isAdmin, promotionController.deletePromotion);

// Toggle promotion status (Admin only)
router.patch('/:id/status', isAdmin, promotionController.togglePromotionStatus);

// Apply promotion (Customer only)
router.post('/apply', promotionController.applyPromotionCode);

module.exports = router;
