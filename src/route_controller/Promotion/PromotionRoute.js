const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const checkCustomer = require('../../middlewares/checkCustomer');
const checkAdmin = require('../../middlewares/checkAdmin');

// Create promotion (Admin only)
router.post('/', checkAdmin, promotionController.createPromotion);

// Get all promotions (Admin or Customer)
router.get('/', promotionController.getAllPromotions);

// Get single promotion by ID (Admin or Customer)
router.get('/:id', promotionController.getPromotionById);

// Update promotion (Admin only)
router.put('/:id', checkAdmin, promotionController.updatePromotion);

// Delete promotion (Admin only)
router.delete('/:id', checkAdmin, promotionController.deletePromotion);

// Apply promotion (Customer only)
router.post('/apply/code', checkCustomer, promotionController.applyPromotionCode);

module.exports = router;
