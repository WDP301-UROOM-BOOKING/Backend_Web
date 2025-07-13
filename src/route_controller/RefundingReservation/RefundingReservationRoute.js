const express = require("express");
const RefundingReservationRouter = express.Router();
const checkCustomer = require("../../middlewares/checkCustomer");
const { isAdmin } = require("../../middlewares/checkAdmin")
const RefundingReservationController= require("./RefundingReservationController");

RefundingReservationRouter.post("/create",checkCustomer,RefundingReservationController.createRefundingReservation);
RefundingReservationRouter.get("/by_userId",checkCustomer,RefundingReservationController.getRefundingReservationsByUserId);
RefundingReservationRouter.put("/banking-info/:refundId",RefundingReservationController.updateBankingInfo);

RefundingReservationRouter.get(
  "/",
  isAdmin,
  RefundingReservationController.getAllRefundingReservations
);

RefundingReservationRouter.get(
  "/:id",
  isAdmin,
  RefundingReservationController.getRefundingReservationById
);

RefundingReservationRouter.put(
  "/:id/status",
  isAdmin,
  RefundingReservationController.updateRefundStatus
);

RefundingReservationRouter.delete(
  "/:id",
  isAdmin,
  RefundingReservationController.deleteRefundingReservation
);

module.exports = RefundingReservationRouter;
