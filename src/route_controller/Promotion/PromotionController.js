const Promotion = require('../../models/Promotion');
const PromotionUser = require('../../models/PromotionUser');
const User = require('../../models/user');

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
    const limit = parseInt(req.query.limit) || (req.user?.role === 'ADMIN' ? 10 : 50);
    const search = req.query.search || '';
    const status = req.query.status; // 'active', 'inactive', 'expired', 'upcoming', 'all'
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Debug logging
    console.log('🔍 getAllPromotions Debug:', {
      userRole: req.user?.role,
      status,
      page,
      limit,
      search
    });

    // Build filter object
    let filter = {};

    // If user is not admin, only show public promotions
    // If user is admin, show all promotions (public and private)
    if (!req.user || req.user.role !== 'ADMIN') {
      filter.type = 'PUBLIC'; // Only public promotions for customers
      console.log('👤 Customer/Guest: filtering PUBLIC promotions only');
    } else {
      console.log('👑 Admin: showing all promotions (PUBLIC + PRIVATE)');
    }
    // Admin can see all promotions (no type filter)

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
    } else if (status === 'all') {
      // For 'all' status: no additional filters (show all promotions)
      // Admin should see all promotions regardless of status
      // Customers will still be filtered by type: 'PUBLIC' above
      console.log('📋 Status filter: ALL - no additional status filters applied');
    } else {
      // Default case (when no status specified):
      // For customers: show only active and upcoming promotions
      // For admin: this shouldn't happen as frontend should always send status
      console.log('⚠️ No specific status filter, applying default logic');
      if (!req.user || req.user.role !== 'ADMIN') {
        filter.isActive = true;
        filter.endDate = { $gte: now }; // endDate >= now (not expired)
        console.log('👤 Customer default: active + upcoming only');
      } else {
        console.log('👑 Admin default: show all');
      }
      // For admin with no status: show all (no additional filters)
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    console.log('🔍 Final filter object:', JSON.stringify(filter, null, 2));

    // Get total count for pagination
    const totalPromotions = await Promotion.countDocuments(filter);
    const totalPages = Math.ceil(totalPromotions / limit);

    console.log('📊 Query results:', {
      totalPromotions,
      totalPages,
      page,
      limit,
      skip
    });

    // For admin status sorting, we need to get ALL promotions first, then sort, then paginate
    let promotions;

    if (req.user && req.user.role === 'ADMIN' && sortBy === 'status') {
      // Get ALL promotions without pagination for custom sorting
      const allPromotions = await Promotion.find(filter);

      const now = new Date();

      // Apply custom sorting to all promotions
      const sortedPromotions = allPromotions.sort((a, b) => {
        // Helper function to get promotion status
        const getPromotionStatus = (promo) => {
          if (!promo.isActive) return 'inactive';
          if (now > new Date(promo.endDate)) return 'expired';
          if (now < new Date(promo.startDate)) return 'upcoming';
          return 'active';
        };

        const statusA = getPromotionStatus(a);
        const statusB = getPromotionStatus(b);

        // Status priority: active > upcoming > inactive > expired
        const statusPriority = {
          'active': 1,
          'upcoming': 2,
          'inactive': 3,
          'expired': 4
        };

        const priorityA = statusPriority[statusA] || 5;
        const priorityB = statusPriority[statusB] || 5;

        if (priorityA !== priorityB) {
          return sortOrder === 1 ? priorityA - priorityB : priorityB - priorityA;
        }

        // Within same status, sort by type (PUBLIC first, then PRIVATE)
        if (a.type !== b.type) {
          return a.type === 'PUBLIC' ? -1 : 1;
        }

        // Within same status and type, sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      // Now apply pagination to the sorted results
      promotions = sortedPromotions.slice(skip, skip + limit);
    } else {
      // For other sorting, use normal database sorting with pagination
      promotions = await Promotion.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);
    }

    console.log('📋 Found promotions:', {
      count: promotions.length,
      types: promotions.reduce((acc, p) => {
        acc[p.type] = (acc[p.type] || 0) + 1;
        return acc;
      }, {})
    });

    // Add user usage information and claimed promotions if user is authenticated
    let allPromotions = [...promotions];
    const userId = req.user?._id;
    const isAdmin = req.user?.role === 'ADMIN';

    if (userId && !isAdmin) {
      // For customers: add claimed private promotions
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

      // Helper function to get promotion status
      const getPromotionStatus = (promotion) => {
        const now = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);

        // Check if user has used up their quota
        if (!promotion.userCanUse) {
          return 'used_up';
        }

        // Check time-based status
        if (now < startDate) {
          return 'upcoming';
        } else if (now > endDate) {
          return 'expired';
        } else if (!promotion.isActive) {
          return 'inactive';
        } else {
          return 'active';
        }
      };

      // Sort promotions: available > coming soon > used up
      allPromotions.sort((a, b) => {
        const statusA = getPromotionStatus(a);
        const statusB = getPromotionStatus(b);

        // Status priority: active > upcoming > used_up > expired > inactive
        const statusPriority = {
          'active': 1,      // Available first
          'upcoming': 2,    // Coming soon second
          'used_up': 3,     // Used up third
          'expired': 4,     // Expired fourth
          'inactive': 5     // Inactive last
        };

        const priorityA = statusPriority[statusA] || 6;
        const priorityB = statusPriority[statusB] || 6;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Within same status, sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else if (isAdmin) {
      // For admin users: just return promotions as-is with basic info
      allPromotions = promotions.map(promotion => {
        const promotionObj = promotion.toObject();
        // Admin doesn't need user-specific usage info
        promotionObj.userUsedCount = 0;
        promotionObj.userCanUse = true;
        promotionObj.isClaimed = false;
        return promotionObj;
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

      // Helper function to get promotion status for non-logged users
      const getPromotionStatus = (promotion) => {
        const now = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);

        if (now < startDate) {
          return 'upcoming';
        } else if (now > endDate) {
          return 'expired';
        } else if (!promotion.isActive) {
          return 'inactive';
        } else {
          return 'active';
        }
      };

      // Sort promotions: available > coming soon > expired/inactive
      allPromotions.sort((a, b) => {
        const statusA = getPromotionStatus(a);
        const statusB = getPromotionStatus(b);

        // Status priority: active > upcoming > expired > inactive
        const statusPriority = {
          'active': 1,      // Available first
          'upcoming': 2,    // Coming soon second
          'expired': 3,     // Expired third
          'inactive': 4     // Inactive last
        };

        const priorityA = statusPriority[statusA] || 5;
        const priorityB = statusPriority[statusB] || 5;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Within same status, sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    // Calculate statistics based on user role
    let statsFilter = {};
    if (!isAdmin && req.user?.role !== 'ADMIN') {
      // For customers, only count public promotions
      statsFilter.type = 'PUBLIC';
    }
    // For admin, count all promotions (no filter)

    const stats = {
      total: await Promotion.countDocuments(statsFilter),
      active: await Promotion.countDocuments({
        ...statsFilter,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }),
      inactive: await Promotion.countDocuments({
        ...statsFilter,
        isActive: false
      }),
      expired: await Promotion.countDocuments({
        ...statsFilter,
        endDate: { $lt: now }
      }),
      upcoming: await Promotion.countDocuments({
        ...statsFilter,
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
          userUsedCount: pu.usedCount, // Frontend expects userUsedCount
          maxUsagePerUser: promotion.maxUsagePerUser,
          userCanUse: canUse && isValid,
          isExpired: !isValid,
          isClaimed: true, // All returned promotions are claimed
          status: !isValid ? 'expired' : !canUse ? 'used_up' : 'available'
        };
      });

    // Sort: Available first, used up last
    validClaimedPromotions.sort((a, b) => {
      // Available promotions first
      if (a.status === 'available' && b.status !== 'available') return -1;
      if (a.status !== 'available' && b.status === 'available') return 1;

      // Within same status, sort by claimed date (newest first)
      return new Date(b.claimedAt) - new Date(a.claimedAt);
    });

    res.json({
      promotions: validClaimedPromotions, // Frontend expects 'promotions' key
      total: validClaimedPromotions.length,
      stats: {
        available: validClaimedPromotions.filter(p => p.status === 'available').length,
        usedUp: validClaimedPromotions.filter(p => p.status === 'used_up').length,
        expired: validClaimedPromotions.filter(p => p.status === 'expired').length,
        public: validClaimedPromotions.filter(p => p.type === 'PUBLIC').length,
        private: validClaimedPromotions.filter(p => p.type === 'PRIVATE').length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== ADMIN PROMOTION USER MANAGEMENT =====

// Get all users who have claimed/used a specific promotion (Admin only)
exports.getPromotionUsers = async (req, res) => {
  try {
    const { id: promotionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status; // 'claimed', 'used', 'all'
    const sortBy = req.query.sortBy || 'claimedAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Check if promotion exists
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Build filter for promotion users
    let filter = { promotionId };

    if (status === 'claimed') {
      filter.isClaimed = true;
    } else if (status === 'used') {
      filter.usedCount = { $gt: 0 };
    }

    // Get promotion users with pagination
    const skip = (page - 1) * limit;

    let promotionUsers = await PromotionUser.find(filter)
      .populate({
        path: 'userId',
        select: 'name email phone avatar createdAt',
        match: search ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        } : {}
      })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Filter out null users (when search doesn't match)
    promotionUsers = promotionUsers.filter(pu => pu.userId);

    // Get total count for pagination
    const totalQuery = await PromotionUser.find(filter).populate({
      path: 'userId',
      select: '_id',
      match: search ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      } : {}
    });

    const total = totalQuery.filter(pu => pu.userId).length;
    const totalPages = Math.ceil(total / limit);

    // Format response data
    const formattedUsers = promotionUsers.map(pu => ({
      _id: pu._id,
      user: {
        _id: pu.userId._id,
        name: pu.userId.name,
        email: pu.userId.email,
        phone: pu.userId.phone,
        avatar: pu.userId.avatar,
        createdAt: pu.userId.createdAt
      },
      usedCount: pu.usedCount,
      isClaimed: pu.isClaimed,
      claimedAt: pu.claimedAt,
      lastUsedAt: pu.lastUsedAt,
      lastReservationId: pu.lastReservationId,
      canUse: pu.usedCount < (promotion.maxUsagePerUser || 1),
      status: !pu.isClaimed ? 'not_claimed' :
              pu.usedCount === 0 ? 'claimed_not_used' :
              pu.usedCount >= (promotion.maxUsagePerUser || 1) ? 'used_up' : 'active',
      createdAt: pu.createdAt,
      updatedAt: pu.updatedAt
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        promotion: {
          _id: promotion._id,
          code: promotion.code,
          name: promotion.name,
          maxUsagePerUser: promotion.maxUsagePerUser,
          usageLimit: promotion.usageLimit,
          usedCount: promotion.usedCount
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: total,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          search,
          status,
          sortBy,
          sortOrder: sortOrder === 1 ? 'asc' : 'desc'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all promotions for a specific user (Admin only)
exports.getUserPromotions = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Check if user exists
    const user = await User.findById(userId).select('name email phone avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's promotion data
    const skip = (page - 1) * limit;
    const promotionUsers = await PromotionUser.find({ userId })
      .populate('promotionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PromotionUser.countDocuments({ userId });
    const totalPages = Math.ceil(total / limit);

    // Format response data
    const formattedPromotions = promotionUsers
      .filter(pu => pu.promotionId) // Filter out null promotions
      .map(pu => {
        const promotion = pu.promotionId;
        const now = new Date();
        const isValid = now >= promotion.startDate && now <= promotion.endDate;
        const canUse = pu.usedCount < (promotion.maxUsagePerUser || 1);

        return {
          _id: pu._id,
          promotion: {
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
            isActive: promotion.isActive
          },
          usedCount: pu.usedCount,
          isClaimed: pu.isClaimed,
          claimedAt: pu.claimedAt,
          lastUsedAt: pu.lastUsedAt,
          canUse: canUse && isValid && promotion.isActive,
          status: !promotion.isActive ? 'inactive' :
                  !isValid ? 'expired' :
                  !pu.isClaimed ? 'not_claimed' :
                  pu.usedCount === 0 ? 'claimed_not_used' :
                  !canUse ? 'used_up' : 'active',
          createdAt: pu.createdAt,
          updatedAt: pu.updatedAt
        };
      });

    // Calculate user statistics
    const stats = {
      totalPromotions: formattedPromotions.length,
      claimed: formattedPromotions.filter(p => p.isClaimed).length,
      used: formattedPromotions.filter(p => p.usedCount > 0).length,
      active: formattedPromotions.filter(p => p.status === 'active').length,
      expired: formattedPromotions.filter(p => p.status === 'expired').length,
      totalUsageCount: formattedPromotions.reduce((sum, p) => sum + p.usedCount, 0)
    };

    res.json({
      success: true,
      data: {
        user,
        promotions: formattedPromotions,
        stats,
        pagination: {
          currentPage: page,
          totalPages,
          totalPromotions: total,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove user from promotion (Admin only)
exports.removeUserFromPromotion = async (req, res) => {
  try {
    const { id: promotionId, userId } = req.params;

    // Check if promotion exists
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Check if user exists
    const user = await User.findById(userId).select('name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find and remove promotion user record
    const promotionUser = await PromotionUser.findOneAndDelete({
      promotionId,
      userId
    });

    if (!promotionUser) {
      return res.status(404).json({ message: 'User is not associated with this promotion' });
    }

    // Update promotion's used count if user had used the promotion
    if (promotionUser.usedCount > 0) {
      await Promotion.findByIdAndUpdate(promotionId, {
        $inc: { usedCount: -promotionUser.usedCount }
      });
    }

    res.json({
      success: true,
      message: `User ${user.name} has been removed from promotion ${promotion.code}`,
      data: {
        removedUsageCount: promotionUser.usedCount,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        promotion: {
          _id: promotion._id,
          code: promotion.code,
          name: promotion.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset user's usage count for a promotion (Admin only)
exports.resetUserPromotionUsage = async (req, res) => {
  try {
    const { id: promotionId, userId } = req.params;

    // Check if promotion exists
    const promotion = await Promotion.findById(promotionId);
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion not found' });
    }

    // Check if user exists
    const user = await User.findById(userId).select('name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find promotion user record
    const promotionUser = await PromotionUser.findOne({
      promotionId,
      userId
    });

    if (!promotionUser) {
      return res.status(404).json({ message: 'User is not associated with this promotion' });
    }

    const oldUsageCount = promotionUser.usedCount;

    // Reset usage count
    promotionUser.usedCount = 0;
    promotionUser.lastUsedAt = null;
    promotionUser.lastReservationId = null;
    await promotionUser.save();

    // Update promotion's used count
    if (oldUsageCount > 0) {
      await Promotion.findByIdAndUpdate(promotionId, {
        $inc: { usedCount: -oldUsageCount }
      });
    }

    res.json({
      success: true,
      message: `Usage count for user ${user.name} has been reset for promotion ${promotion.code}`,
      data: {
        resetUsageCount: oldUsageCount,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        promotion: {
          _id: promotion._id,
          code: promotion.code,
          name: promotion.name
        },
        promotionUser: {
          _id: promotionUser._id,
          usedCount: promotionUser.usedCount,
          isClaimed: promotionUser.isClaimed,
          claimedAt: promotionUser.claimedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


