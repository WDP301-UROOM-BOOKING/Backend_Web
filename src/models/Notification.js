const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Number,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'NEW_MESSAGE',
        'BOOKING_CONFIRMED',
        'BOOKING_CANCELLED',
        'BOOKING_UPDATED',
        'PAYMENT_SUCCESS',
        'REFUND_PROCESSED',
        'REFUND_APPROVED',
        'REFUND_REJECTED',
        'CHECK_IN_REMINDER',
        'CHECK_OUT_REMINDER',
        'PROMOTION_AVAILABLE',
        'SYSTEM_ANNOUNCEMENT'
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
      },
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatMessage',
      },
      promotionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion',
      },
      refundAmount: {
        type: Number,
      },
      // additionalData: {
      //   type: mongoose.Schema.Types.Mixed,
      // }
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    readAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }
  },
  { 
    versionKey: false,
    timestamps: true 
  }
);

// Indexes for better performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Notification", notificationSchema);