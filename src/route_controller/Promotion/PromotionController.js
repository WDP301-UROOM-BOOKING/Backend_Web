const Promotion = require('../../models/Promotion');

// Create new promotion
exports.createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion({ ...req.body, createdBy: req.user._id });
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all promotions
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get promotion by ID
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) return res.status(404).json({ message: 'Promotion not found' });
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update promotion
exports.updatePromotion = async (req, res) => {
  try {
    const updatedPromotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPromotion) return res.status(404).json({ message: 'Promotion not found' });
    res.json(updatedPromotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete promotion
exports.deletePromotion = async (req, res) => {
  try {
    const deleted = await Promotion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Promotion not found' });
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply promotion code
exports.applyPromotionCode = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const promotion = await Promotion.findOne({ code: code.toUpperCase(), isActive: true });

    if (!promotion) return res.status(404).json({ message: 'Invalid or inactive promotion code' });

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return res.status(400).json({ message: 'Promotion is not active at this time' });
    }

    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return res.status(400).json({ message: 'Promotion usage limit exceeded' });
    }

    if (orderAmount < promotion.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount is ${promotion.minOrderAmount}` });
    }

    let discount = 0;
    if (promotion.discountType === 'PERCENTAGE') {
      discount = (orderAmount * promotion.discountValue) / 100;
      if (promotion.maxDiscountAmount) {
        discount = Math.min(discount, promotion.maxDiscountAmount);
      }
    } else if (promotion.discountType === 'FIXED_AMOUNT') {
      discount = promotion.discountValue;
    }

    res.json({
      valid: true,
      discount,
      message: 'Promotion applied successfully',
      promotionId: promotion._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
