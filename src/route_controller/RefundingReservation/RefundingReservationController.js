const RefundingReservation = require("../../models/refundingReservation");
const asyncHandler = require("../../middlewares/asyncHandler");

const createRefundingReservation = asyncHandler(async (req, res) => {
  const { idReservation, refundAmount, accountHolderName, accountNumber, bankName } = req.body;
  const user = req.user;
  
  if (!user || !idReservation || !refundAmount) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const refund = await RefundingReservation.create({
    user: user._id,
    reservation: idReservation,
    refundAmount,
    accountHolderName,
    accountNumber,
    bankName
  });

  res.status(201).json({
    message: "Refund request created successfully.",
    data: refund,
  });
});

// GET /api/refunds/user/:userId
const getRefundingReservationsByUserId = asyncHandler(async (req, res) => {
    const user = req.user;

  const refunds = await RefundingReservation.find({ user: user._id })
    .populate("reservation") // nếu muốn lấy thông tin chi tiết reservation
    .populate("user")
    .sort({ createdAt: -1 }); // sắp xếp mới nhất trước

  res.status(200).json({
    count: refunds.length,
    data: refunds,
  });
});

module.exports = {
  createRefundingReservation,
  getRefundingReservationsByUserId
};
