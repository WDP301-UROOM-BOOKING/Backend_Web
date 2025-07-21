const Promotion = require('../../models/Promotion');
const PromotionUser = require('../../models/PromotionUser');

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

    // Build filter object for public promotions
    let filter = {
      type: 'PUBLIC' // Public promotions hiển thị cho tất cả user
    };

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

    // Add user usage information and claimed promotions if user is authenticated
    let allPromotions = [...promotions];
    const userId = req.user?._id;

    if (userId) {
      // Get user's claimed private promotions (not in public list)
      const claimedPromotions = await PromotionUser.find({
        userId: userId,
        isClaimed: true
      }).populate('promotionId');

      // Filter claimed private promotions that are not already in public list
      const claimedPrivatePromotions = claimedPromotions
        .filter(pu => pu.promotionId &&
                     pu.promotionId.isActive &&
                     pu.promotionId.type === 'PRIVATE' &&
                     !promotions.some(p => p._id.toString() === pu.promotionId._id.toString()))
        .map(pu => pu.promotionId);

      // Add claimed private promotions to the list
      allPromotions = [...promotions, ...claimedPrivatePromotions];

      // Get user usage for all promotions
      const promotionIds = allPromotions.map(p => p._id);
      const userUsages = await PromotionUser.find({
        promotionId: { $in: promotionIds },
        userId: userId
      });

      // Create a map for quick lookup
      const usageMap = {};
      userUsages.forEach(usage => {
        usageMap[usage.promotionId.toString()] = {
          usedCount: usage.usedCount,
          isClaimed: usage.isClaimed
        };
      });

      // Add usage info to all promotions
      allPromotions = allPromotions.map(promotion => {
        const promotionObj = promotion.toObject();
        const userUsage = usageMap[promotion._id.toString()];
        promotionObj.userUsedCount = userUsage?.usedCount || 0;
        promotionObj.userCanUse = (userUsage?.usedCount || 0) < (promotion.maxUsagePerUser || 1);
        promotionObj.isClaimed = userUsage?.isClaimed || false;
        return promotionObj;
      });

      // Sort promotions: available first, used up last
      allPromotions.sort((a, b) => {
        // First priority: available promotions (userCanUse = true)
        if (a.userCanUse && !b.userCanUse) return -1;
        if (!a.userCanUse && b.userCanUse) return 1;

        // Second priority: within same availability, sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else {
      // For non-logged in users, just add default values
      allPromotions = promotions.map(promotion => {
        const promotionObj = promotion.toObject();
        promotionObj.userUsedCount = 0;
        promotionObj.userCanUse = true;
        promotionObj.isClaimed = false;
        return promotionObj;
      });

      // Sort by creation date (newest first) for non-logged in users
      allPromotions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

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
      promotions: allPromotions,
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
    const userId = req.user?._id; // Lấy user ID từ middleware authentication

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

    // Kiểm tra giới hạn sử dụng per user và auto-claim nếu user đã đăng nhập
    if (userId && promotion.maxUsagePerUser) {
      let promotionUser = await PromotionUser.findOne({
        promotionId: promotion._id,
        userId: userId
      });

      if (promotionUser && promotionUser.usedCount >= promotion.maxUsagePerUser) {
        return res.status(400).json({
          message: `You have reached the maximum usage limit (${promotion.maxUsagePerUser}) for this promotion`
        });
      }

      // Auto-claim promotion if not claimed yet
      if (!promotionUser) {
        promotionUser = new PromotionUser({
          promotionId: promotion._id,
          userId: userId
        });
      }

      if (!promotionUser.isClaimed) {
        await promotionUser.claimPromotion();
      }
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

// Claim promotion code
exports.claimPromotionCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required to claim promotion' });
    }

    const promotion = await Promotion.findOne({ code: code.toUpperCase(), isActive: true });

    if (!promotion) return res.status(404).json({ message: 'Invalid or inactive promotion code' });

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return res.status(400).json({ message: 'Promotion is not active at this time' });
    }

    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return res.status(400).json({ message: 'Promotion usage limit exceeded' });
    }

    // Kiểm tra user đã claim chưa
    let promotionUser = await PromotionUser.findOne({
      promotionId: promotion._id,
      userId: userId
    });

    if (promotionUser && promotionUser.isClaimed) {
      return res.status(400).json({
        message: 'You have already claimed this promotion',
        promotion: {
          code: promotion.code,
          name: promotion.name,
          claimedAt: promotionUser.claimedAt
        }
      });
    }

    // Tạo hoặc cập nhật PromotionUser record
    if (!promotionUser) {
      promotionUser = new PromotionUser({
        promotionId: promotion._id,
        userId: userId
      });
    }

    await promotionUser.claimPromotion();

    res.json({
      success: true,
      message: 'Promotion claimed successfully!',
      promotion: {
        code: promotion.code,
        name: promotion.name,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        maxDiscountAmount: promotion.maxDiscountAmount,
        minOrderAmount: promotion.minOrderAmount,
        claimedAt: promotionUser.claimedAt,
        usedCount: promotionUser.usedCount,
        maxUsagePerUser: promotion.maxUsagePerUser
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's claimed promotions
exports.getClaimedPromotions = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Lấy tất cả promotions user đã claim
    const claimedPromotions = await PromotionUser.find({
      userId: userId,
      isClaimed: true
    }).populate('promotionId');

    // Filter ra những promotion còn active và valid
    const validClaimedPromotions = claimedPromotions
      .filter(pu => pu.promotionId && pu.promotionId.isActive)
      .map(pu => {
        const promotion = pu.promotionId;
        const now = new Date();
        const isValid = now >= promotion.startDate && now <= promotion.endDate;
        const canUse = pu.usedCount < (promotion.maxUsagePerUser || 1);

        return {
          _id: promotion._id,
          code: promotion.code,
          name: promotion.name,
          description: promotion.description,
          discountType: promotion.discountType,
          discountValue: promotion.discountValue,
          maxDiscountAmount: promotion.maxDiscountAmount,
          minOrderAmount: promotion.minOrderAmount,
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          type: promotion.type,
          // User-specific data
          claimedAt: pu.claimedAt,
          usedCount: pu.usedCount,
          maxUsagePerUser: promotion.maxUsagePerUser,
          userCanUse: canUse && isValid,
          isExpired: !isValid,
          status: !isValid ? 'expired' : !canUse ? 'used_up' : 'available'
        };
      });

    res.json({
      claimedPromotions: validClaimedPromotions,
      total: validClaimedPromotions.length,
      available: validClaimedPromotions.filter(p => p.status === 'available').length,
      used: validClaimedPromotions.filter(p => p.status === 'used_up').length,
      expired: validClaimedPromotions.filter(p => p.status === 'expired').length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
