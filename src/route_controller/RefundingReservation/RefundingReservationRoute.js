const express = require("express");
const RefundingReservationRouter = express.Router();
const checkCustomer = require("../../middlewares/checkCustomer");
const RefundingReservationController= require("./RefundingReservationController");

RefundingReservationRouter.post("/create",checkCustomer,RefundingReservationController.createRefundingReservation);
RefundingReservationRouter.get("/by_userId",checkCustomer,RefundingReservationController.getRefundingReservationsByUserId);
RefundingReservationRouter.put("/banking-info/:refundId",RefundingReservationController.updateBankingInfo);

module.exports = RefundingReservationRouter;
