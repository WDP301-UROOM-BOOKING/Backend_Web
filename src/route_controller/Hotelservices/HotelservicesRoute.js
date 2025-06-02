const express = require("express");
const HotelServiceRouter = express.Router();
const HotelServiceController = require("./HotelservicesController");
const checkOwner = require("../../middlewares/checkOwner");

HotelServiceRouter.put("/update-service/:serviceId", HotelServiceController.updateHotelService);

module.exports = HotelServiceRouter;
