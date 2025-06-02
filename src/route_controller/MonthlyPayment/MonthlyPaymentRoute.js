const express = require('express');
const router = express.Router();
const monthlyPaymentController = require("./MonthlyPaymentController");
const checkOwner = require('../../middlewares/checkOwner');

router.get('/all', checkOwner, monthlyPaymentController.getPayments);

module.exports = router;
