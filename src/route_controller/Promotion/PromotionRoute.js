const express = require('express');
const router = express.Router();
const promotionController = require('./PromotionController');
const checkCustomer = require('../../middlewares/checkCustomer');
const checkAdmin = require('../../middlewares/checkAdmin');

// // Create promotion (Admin only)
// router.post('/', checkAdmin, promotionController.createPromotion);

// // Get all promotions (Admin or Customer)
// router.get('/', promotionController.getAllPromotions);
//Test 
router.get('/test', (req, res) => {
  res.json({ message: 'Promotion route is working!' });
});

// // Get single promotion by ID (Admin or Customer)
// router.get('/:id', promotionController.getPromotionById);

// // Update promotion (Admin only)
// router.put('/:id', checkAdmin, promotionController.updatePromotion);

// // Delete promotion (Admin only)
// router.delete('/:id', checkAdmin, promotionController.deletePromotion);

// Apply promotion (Customer only)
router.post('/apply', promotionController.applyPromotionCode);

module.exports = router;
