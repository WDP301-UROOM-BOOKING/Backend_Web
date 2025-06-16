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

// Update banking information for refund
const updateBankingInfo = async (req, res) => {
  try {
    const { refundId } = req.params;
    const { accountHolderName, accountNumber, bankName } = req.body;

    // Validate required fields
    if (!accountHolderName || !accountNumber || !bankName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all banking information',
      });
    }

    const refund = await RefundingReservation.findById(refundId);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found',
      });
    }

    // Update banking information
    refund.accountHolderName = accountHolderName;
    refund.accountNumber = accountNumber;
    refund.bankName = bankName;
    refund.status = 'PENDING'; // Change status from WAITING_FOR_BANK_INFO to PENDING

    await refund.save();

    return res.status(200).json({
      success: true,
      message: 'Banking information updated successfully',
      data: refund,
    });

  } catch (error) {
    console.error('Error updating banking info:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createRefundingReservation,
  getRefundingReservationsByUserId,
  updateBankingInfo
};
