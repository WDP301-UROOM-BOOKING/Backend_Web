const express = require("express");
const PaymentRouter = express.Router();

const PaymentController = require("./PaymentController");
const checkCustomer = require("../../middlewares/checkCustomer");
const checkOwner = require("../../middlewares/checkOwner");
// const bodyParser = require("body-parser");

PaymentRouter.post(
  "/create-booking",
  checkCustomer,
  PaymentController.createBooking
);
PaymentRouter.post(
  "/checkout-booking",
  checkCustomer,
  PaymentController.checkoutBooking
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

// Webhook Stripe phải dùng raw body
// PaymentRouter.post(
//   "/api/payment/webhook",
//   bodyParser.raw({ type: "application/json" }),
//   PaymentController.stripeWebhookHandler
// )

module.exports = PaymentRouter;
