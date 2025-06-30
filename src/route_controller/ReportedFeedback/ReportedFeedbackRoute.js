const express = require("express");
const ReportFeedbackRouter = express.Router();
const ReportFeedbackController = require("./ReportedFeedbackController");
const checkCustomer = require("../../middlewares/checkCustomer");
const checkOwner = require("../../middlewares/checkOwner");
const { isAdmin } = require("../../middlewares/checkAdmin");
const checkRole = require("../../middlewares/checkRole");

ReportFeedbackRouter.get(
  "/getAllReportedFeedbacks",
  ReportFeedbackController.getAllReportedFeedbacks
);
ReportFeedbackRouter.put(
  "/update_Report/:reportId",
  checkCustomer,
  ReportFeedbackController.updateReportStatus
);
ReportFeedbackRouter.delete(
  "/delete_report_feedback/:reportId",
  checkCustomer,
  ReportFeedbackController.deleteReportedFeedback
);
ReportFeedbackRouter.post(
  "/create_report_feedback",
  checkCustomer,
  ReportFeedbackController.reportFeedback
);
ReportFeedbackRouter.post(
  "/create_report_feedback_owner",
  checkOwner,
  ReportFeedbackController.reportFeedback
);
ReportFeedbackRouter.get(
  "/my-reports",
  checkRole(["CUSTOMER", "OWNER"]),
  ReportFeedbackController.getReportedFeedbackByUserId
);
ReportFeedbackRouter.get(
  "/getReportedFeedbackDetails",
  isAdmin,
  ReportFeedbackController.getAllReportedFeedbackDetails 
);
ReportFeedbackRouter.get(
  "/getReportedFeedbackByFeedbackId/:feedbackId",
  isAdmin,
  ReportFeedbackController.getAllReportsOfFeedback 
);
ReportFeedbackRouter.put("/updateReportStatus/:reportId", isAdmin, ReportFeedbackController.updateReportStatus);
module.exports = ReportFeedbackRouter;
