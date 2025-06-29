const express = require("express");
const router = express.Router();
const DashboardOwnerController = require("./DashboardOwnerController");
const checkOwner = require("../../middlewares/checkOwner");
// const { checkOwner } = require("../../middlewares/checkOwner");

// Get dashboard metrics for hotel owner
router.get("/metrics", checkOwner, DashboardOwnerController.getDashboardMetrics);

module.exports = router; 