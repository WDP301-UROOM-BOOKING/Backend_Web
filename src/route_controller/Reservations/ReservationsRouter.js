const express = require("express");
const ReservationRouter = express.Router();
const reservationController = require("./ReservationsController");
const checkCustomer = require("../../middlewares/checkCustomer");
ReservationRouter.get(
  "/get-reservation",
  checkCustomer,
  reservationController.getReservationsByUserId
);
ReservationRouter.get("/reservations-detail/:id",checkCustomer, reservationController.getReservationById);
ReservationRouter.get(
  '/detail/:reservationId',
  checkCustomer,
  reservationController.getReservationDetailById
)

ReservationRouter.put(
  "/update-reservations/:id",
  checkCustomer,
  reservationController.updateReservationById
);
module.exports = ReservationRouter;
