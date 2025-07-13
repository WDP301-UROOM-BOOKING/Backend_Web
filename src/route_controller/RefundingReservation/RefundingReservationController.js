const RefundingReservation = require("../../models/refundingReservation");
const asyncHandler = require("../../middlewares/asyncHandler");

const createRefundingReservation = asyncHandler(async (req, res) => {
  try {
    const {
      idReservation,
      refundAmount,
      accountHolderName,
      accountNumber,
      bankName,
    } = req.body;
    const user = req.user;
    if (!user || !idReservation || !refundAmount) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    console.log('user._id >> ', user._id);
    console.log('idReservation >> ', idReservation);
    console.log('refundAmount >> ', refundAmount);

    const cleanedRefundAmount = parseFloat(
      refundAmount.replace(/[^0-9.-]+/g, "")
    );

    const refund = await RefundingReservation.create({
      user: user._id,
      reservation: idReservation,
      refundAmount: cleanedRefundAmount,
      status: "PENDING",
      accountHolderName,
      accountNumber,
      bankName,
    });

    console.log('refund >> ', refund);

    res.status(201).json({
      message: "Refund request created successfully.",
      data: refund,
    });
  } catch (err) {
    console.error("Error creating refund request >>", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// [GET] Lấy yêu cầu hoàn tiền của user đang đăng nhập
const getRefundingReservationsByUserId = asyncHandler(async (req, res) => {
  const user = req.user;

  const refunds = await RefundingReservation.find({ user: user._id })
    .populate("reservation")
    .populate("user")
    .sort({ createdAt: -1 });

  res.status(200).json({
    count: refunds.length,
    data: refunds,
  });
});

// [PUT] Cập nhật thông tin ngân hàng cho yêu cầu hoàn tiền
const updateBankingInfo = asyncHandler(async (req, res) => {
  const { refundId } = req.params;
  const { accountHolderName, accountNumber, bankName } = req.body;

  if (!accountHolderName || !accountNumber || !bankName) {
    return res.status(400).json({
      success: false,
      message: "Please provide all banking information",
    });
  }

  const refund = await RefundingReservation.findById(refundId);
  if (!refund) {
    return res.status(404).json({
      success: false,
      message: "Refund request not found",
    });
  }

  refund.accountHolderName = accountHolderName;
  refund.accountNumber = accountNumber;
  refund.bankName = bankName;
  refund.status = "PENDING";

  await refund.save();

  res.status(200).json({
    success: true,
    message: "Banking information updated successfully",
    data: refund,
  });
});

// [GET] Admin - Lấy toàn bộ yêu cầu hoàn tiền
const getAllRefundingReservations = asyncHandler(async (req, res) => {
  const refunds = await RefundingReservation.find()
    .populate("reservation")
    .populate("user")
    .sort({ createdAt: -1 });

  res.status(200).json({
    count: refunds.length,
    data: refunds,
  });
});

// [GET] Lấy chi tiết một yêu cầu hoàn tiền
const getRefundingReservationById = asyncHandler(async (req, res) => {
  const refund = await RefundingReservation.findById(req.params.id)
    .populate("reservation")
    .populate("user");

  if (!refund) {
    return res.status(404).json({ message: "Refund request not found." });
  }

  res.status(200).json({ data: refund });
});

// [PUT] Admin - Cập nhật trạng thái yêu cầu hoàn tiền
const updateRefundStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  const refund = await RefundingReservation.findById(req.params.id);
  if (!refund) {
    return res.status(404).json({ message: "Refund request not found." });
  }

  refund.status = status;
  await refund.save();

  res.status(200).json({
    message: "Refund status updated successfully.",
    data: refund,
  });
});

// [DELETE] Xoá yêu cầu hoàn tiền
const deleteRefundingReservation = asyncHandler(async (req, res) => {
  const refund = await RefundingReservation.findById(req.params.id);
  if (!refund) {
    return res.status(404).json({ message: "Refund request not found." });
  }

  await refund.remove();

  res.status(200).json({ message: "Refund request deleted successfully." });
});

module.exports = {
  createRefundingReservation,
  getRefundingReservationsByUserId,
  updateBankingInfo,
  getAllRefundingReservations,
  getRefundingReservationById,
  updateRefundStatus,
  deleteRefundingReservation,
};
