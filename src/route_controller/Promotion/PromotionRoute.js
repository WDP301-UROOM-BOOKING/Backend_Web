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

// Get claimed promotions (Customer only) - MUST be before /:id route
router.get('/claimed', checkCustomer, promotionController.getClaimedPromotions);

// Apply promotion (Customer only)
router.post('/apply', checkCustomer, promotionController.applyPromotionCode);

// Claim promotion (Customer only)
router.post('/claim', checkCustomer, promotionController.claimPromotionCode);

// ===== ADMIN PROMOTION USER MANAGEMENT ROUTES =====

// Get users who have claimed/used a specific promotion (Admin only)
router.get('/:id/users', isAdmin, promotionController.getPromotionUsers);

// Get all promotions for a specific user (Admin only)
router.get('/users/:userId', isAdmin, promotionController.getUserPromotions);

// Remove user from promotion (Admin only)
router.delete('/:id/users/:userId', isAdmin, promotionController.removeUserFromPromotion);

// Reset user's usage count for a promotion (Admin only)
router.put('/:id/users/:userId/reset', isAdmin, promotionController.resetUserPromotionUsage);



// Toggle promotion status (Admin only)
router.patch('/:id/status', isAdmin, promotionController.togglePromotionStatus);

// Update promotion (Admin only)
router.put('/:id', isAdmin, promotionController.updatePromotion);

// Delete promotion (Admin only)
router.delete('/:id', isAdmin, promotionController.deletePromotion);

// Get single promotion by ID (Admin or Customer) - MUST be last among /:id routes
router.get('/:id', promotionController.getPromotionById);

module.exports = router;
