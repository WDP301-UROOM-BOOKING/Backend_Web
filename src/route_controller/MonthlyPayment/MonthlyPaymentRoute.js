const express = require('express');
const router = express.Router();
const monthlyPaymentController = require("./MonthlyPaymentController");
const checkOwner = require('../../middlewares/checkOwner');
const { isAdmin } = require('../../middlewares/checkAdmin');

router.get('/all', checkOwner, monthlyPaymentController.getPayments);

// Routes cho admin
router.get('/admin/all', isAdmin, monthlyPaymentController.getAllPaymentsForAdmin);
router.put('/admin/:paymentId/status', isAdmin, monthlyPaymentController.updatePaymentStatus);
router.get('/admin/:paymentId', isAdmin, monthlyPaymentController.getPaymentById);

module.exports = router;
