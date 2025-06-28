const ReportedFeedback = require("../../models/reportedFeedback");
const Feedback = require("../../models/feedback");
const asyncHandler = require("../../middlewares/asyncHandler");

exports.reportFeedback = asyncHandler(async (req, res) => {
  const userId = Number(req.user._id);
  const { feedbackId, reason, description } = req.body;

  if (!feedbackId || !reason) {
    return res.status(400).json({
      error: true,
      message: "Missing feedbackId or reason for the report.",
    });
  }

  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) {
    return res.status(404).json({
      error: true,
      message: "Feedback not found.",
    });
  }

  if (Number(feedback.user) === userId) {
    return res.status(400).json({
      error: true,
      message: "You cannot report your own feedback.",
    });
  }

  const hasReported = await ReportedFeedback.findOne({
    user: userId,
    feedback: feedbackId,
  });

  if (hasReported) {
    return res.status(400).json({
      error: true,
      message: "You can only report this feedback once.",
    });
  }

  const newReport = new ReportedFeedback({
    user: userId,
    feedback: feedbackId,
    reason,
    description,
    status: "PENDING",
  });

  await newReport.save();

  return res.status(201).json({
    error: false,
    message: "Report submitted successfully.",
    data: newReport,
  });
});






exports.updateReportStatus = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;

  if (!["APPROVED", "REJECT"].includes(status)) {
    return res.status(400).json({
      error: true,
      message: "Trạng thái không hợp lệ. Chỉ cho phép APPROVED hoặc REJECT.",
    });
  }

  const report = await ReportedFeedback.findById(reportId);
  if (!report) {
    return res.status(404).json({
      error: true,
      message: "Báo cáo không tồn tại.",
    });
  }

  if (report.status !== "PENDING") {
    return res.status(400).json({
      error: true,
      message: "Chỉ có thể cập nhật trạng thái khi báo cáo đang chờ xử lý (PENDING).",
    });
  }

  report.status = status;
  await report.save();

  res.status(200).json({
    error: false,
    message: "Cập nhật trạng thái thành công.",
    data: report,
  });
});


exports.getAllReportedFeedbacks = asyncHandler(async (req, res) => {
  const userId = Number(req.user._id);

  const query = isAdmin ? {} : { user: userId };

  const reports = await ReportedFeedback.find(query)
    .populate("user")
    .populate("feedback");

  res.status(200).json({
    error: false,
    message: "Lấy danh sách báo cáo thành công.",
    data: reports,
  });
});

exports.deleteReportedFeedback = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const userId = Number(req.user._id);

  const report = await ReportedFeedback.findById(reportId);
  if (!report) {
    return res.status(404).json({
      error: true,
      message: "Không tìm thấy báo cáo.",
    });
  }

  if (report.user !== userId) {
    return res.status(403).json({
      error: true,
      message: "Bạn không có quyền xoá báo cáo này.",
    });
  }

  if (report.status !== "PENDING") {
    return res.status(400).json({
      error: true,
      message: "Chỉ có thể xoá báo cáo khi đang chờ xử lý (PENDING).",
    });
  }

  await ReportedFeedback.findByIdAndDelete(reportId);

  res.status(200).json({
    error: false,
    message: "Xoá báo cáo thành công.",
  });
});


exports.getReportedFeedbackByUserId = asyncHandler(async (req, res) => {
  const userId = Number(req.user._id);

  const reports = await ReportedFeedback.find({ user: userId })
    .populate("user")
    .populate("feedback");

  if (!reports || reports.length === 0) {
    return res.status(404).json({
      error: true,
      message: "Không có báo cáo nào được tìm thấy cho người dùng này.",
    });
  }
  console.log("Reports:", reports);
  res.status(200).json({
    error: false,
    message: "Lấy báo cáo phản hồi theo người dùng thành công.",
    data: reports,
  });
});



exports.getAllReportedFeedbackDetails = asyncHandler(async (req, res) => {

  const reportedFeedbacks = await ReportedFeedback.find({})
    .populate({
      path: "feedback",
      populate: [
        { path: "hotel", model: "Hotel" },
        { path: "user", model: "User" } // <-- LẤY NGƯỜI ĐÁNH GIÁ
      ]
    })
    .populate("user"); 

  const uniqueFeedbackMap = new Map();

  for (const report of reportedFeedbacks) {
    const feedbackId = report.feedback?._id?.toString();
    if (!feedbackId) continue;

   
    if (!uniqueFeedbackMap.has(feedbackId)) {
      uniqueFeedbackMap.set(feedbackId, {
        feedback: report.feedback,
        reports: [],
      });
    }

   
    uniqueFeedbackMap.get(feedbackId).reports.push({
      reportedBy: report.user,
      createdAt: report.createdAt,
      reason: report.reason,
      description: report.description,
      status: report.status,
    });
  }

  const result = Array.from(uniqueFeedbackMap.values());

  return res.status(200).json({
    error: false,
    message: "Lấy danh sách feedback bị báo cáo thành công.",
    data: result,
  });
});
exports.getAllReportsOfFeedback = asyncHandler(async (req, res) => {
  const { feedbackId } = req.params;

  if (!feedbackId) {
    return res.status(400).json({
      error: true,
      message: "Thiếu feedbackId.",
    });
  }

  const reports = await ReportedFeedback.find({ feedback: feedbackId })
    .populate("user") 
    .populate({
      path: "feedback",
      populate: [
        { path: "hotel", model: "Hotel" },
        { path: "user", model: "User" } 
      ]
    });

  if (!reports || reports.length === 0) {
    return res.status(404).json({
      error: true,
      message: "Không tìm thấy báo cáo nào cho feedback này.",
    });
  }

  return res.status(200).json({
    error: false,
    message: "Lấy danh sách báo cáo thành công.",
    data: reports,
  });
});
exports.updateReportStatus = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status, rejectReason } = req.body;

  if (!["APPROVED", "REJECT"].includes(status)) {
    return res.status(400).json({
      error: true,
      message: "Trạng thái không hợp lệ. Chỉ cho phép APPROVED hoặc REJECT.",
    });
  }

  const report = await ReportedFeedback.findById(reportId);
  if (!report) {
    return res.status(404).json({
      error: true,
      message: "Báo cáo không tồn tại.",
    });
  }

  if (report.status !== "PENDING") {
    return res.status(400).json({
      error: true,
      message: "Chỉ có thể cập nhật trạng thái khi báo cáo đang chờ xử lý (PENDING).",
    });
  }

  if (status === "REJECT" && (!rejectReason || rejectReason.trim() === "")) {
    return res.status(400).json({
      error: true,
      message: "Cần cung cấp lý do từ chối khi cập nhật trạng thái là REJECT.",
    });
  }

  report.status = status;

  if (status === "REJECT") {
    report.rejectReason = rejectReason.trim();
  }

  await report.save();

  res.status(200).json({
    error: false,
    message: "Cập nhật trạng thái thành công.",
    data: report,
  });
});
