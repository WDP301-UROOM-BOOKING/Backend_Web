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

// Get all promotions with pagination
exports.getAllPromotions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status; // 'active', 'inactive', 'expired', 'upcoming', 'all'
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter object
    let filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    const now = new Date();
    if (status === 'active') {
      filter.isActive = true;
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    } else if (status === 'inactive') {
      filter.isActive = false;
    } else if (status === 'expired') {
      filter.endDate = { $lt: now };
    } else if (status === 'upcoming') {
      // Upcoming: active promotions that haven't started yet
      filter.isActive = true;
      filter.startDate = { $gt: now };
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalPromotions = await Promotion.countDocuments(filter);
    const totalPages = Math.ceil(totalPromotions / limit);

    // Get promotions with pagination
    const promotions = await Promotion.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Calculate statistics
    const stats = {
      total: await Promotion.countDocuments(),
      active: await Promotion.countDocuments({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }),
      inactive: await Promotion.countDocuments({ isActive: false }),
      expired: await Promotion.countDocuments({ endDate: { $lt: now } }),
      upcoming: await Promotion.countDocuments({
        isActive: true,
        startDate: { $gt: now }
      })
    };

    res.json({
      promotions,
      pagination: {
        currentPage: page,
        totalPages,
        totalPromotions,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats,
      filters: {
        search,
        status,
        sortBy,
        sortOrder: req.query.sortOrder || 'desc'
      }
    });
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

// Toggle promotion status
exports.togglePromotionStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const updatedPromotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    );
    if (!updatedPromotion) return res.status(404).json({ message: 'Promotion not found' });
    res.json(updatedPromotion);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
