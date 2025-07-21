const mongoose = require("mongoose");

const promotionUserSchema = new mongoose.Schema(
  {
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promotion",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Trạng thái claim promotion
    isClaimed: {
      type: Boolean,
      default: false,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    // Lưu lại thông tin lần sử dụng gần nhất
    lastUsedAt: {
      type: Date,
      default: null,
    },
    // Lưu lại reservation ID của lần sử dụng gần nhất (để rollback nếu cần)
    lastReservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },
  },
  { 
    versionKey: false,
    timestamps: true 
  }
);

// Tạo compound index để đảm bảo mỗi user chỉ có 1 record cho mỗi promotion
promotionUserSchema.index({ promotionId: 1, userId: 1 }, { unique: true });

// Method để kiểm tra user có thể sử dụng promotion không
promotionUserSchema.methods.canUsePromotion = function(maxUsagePerUser) {
  return this.usedCount < maxUsagePerUser;
};

// Method để claim promotion
promotionUserSchema.methods.claimPromotion = function() {
  this.isClaimed = true;
  this.claimedAt = new Date();
  return this.save();
};

// Method để tăng usage count
promotionUserSchema.methods.incrementUsage = function(reservationId) {
  this.usedCount += 1;
  this.lastUsedAt = new Date();
  this.lastReservationId = reservationId;
  // Tự động claim nếu chưa claim
  if (!this.isClaimed) {
    this.isClaimed = true;
    this.claimedAt = new Date();
  }
  return this.save();
};

// Method để giảm usage count (khi rollback)
promotionUserSchema.methods.decrementUsage = function() {
  if (this.usedCount > 0) {
    this.usedCount -= 1;
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model("PromotionUser", promotionUserSchema);
