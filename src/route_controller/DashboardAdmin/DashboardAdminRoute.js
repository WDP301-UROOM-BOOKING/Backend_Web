const express = require("express");
const router = express.Router();
const DashboardAdminController = require("./DashboardAdminController");
const { isAdmin } = require("../../middlewares/checkAdmin");

// Get dashboard metrics for admin
router.get("/metrics", isAdmin, DashboardAdminController.getDashboardMetricsAdmin);

module.exports = router;
