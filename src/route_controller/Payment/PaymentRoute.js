const express = require("express");
const PaymentRouter = express.Router();

const PaymentController = require("./PaymentController");
const checkCustomer = require("../../middlewares/checkCustomer");
const checkOwner = require("../../middlewares/checkOwner");

PaymentRouter.post(
  "/create-booking",
  checkCustomer,
  PaymentController.createBooking
);
PaymentRouter.post(
  "/cancel-payment",
  checkCustomer,
  PaymentController.cancelPayment
);
PaymentRouter.post(
  "/accept-payment",
  checkCustomer,
  PaymentController.acceptPayment
);
PaymentRouter.get(
  "/reservations",
  checkOwner,
  PaymentController.getReservations
);

module.exports = PaymentRouter;
