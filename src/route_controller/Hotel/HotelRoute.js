const express = require("express");
const HotelRouter = express.Router();
const HotelController = require("./HotelController");
const checkCustomer = require("../../middlewares/checkCustomer");
const checkGuest = require("../../middlewares/cheskGuest");
const checkOwner = require("../../middlewares/checkOwner");
const upload = require("../../middlewares/uploadMiddleware");

HotelRouter.get("/get-all-hotel", HotelController.getAllHotels);
HotelRouter.post("/get-hotel-byId", HotelController.getHotelsByIds);
HotelRouter.post("/remove-favorite", checkCustomer, HotelController.removeFavoriteHotel);
HotelRouter.post("/add-favorite", checkCustomer, HotelController.addFavoriteHotel);
HotelRouter.get("/hotel_detail/:hotelId", checkGuest, HotelController.getHotelDetails);
HotelRouter.get("/top-bookings", checkGuest, HotelController.getTop3HotelsThisMonth);
HotelRouter.post("/remove-favorite", checkCustomer, HotelController.removeFavoriteHotel);
HotelRouter.post("/add-favorite", checkCustomer, HotelController.addFavoriteHotel);
HotelRouter.get("/hotel_detail/:hotelId", checkGuest, HotelController.getHotelDetails);
HotelRouter.get("/top-bookings", HotelController.getTop3HotelsThisMonth);
HotelRouter.get("/owner-hotels", checkOwner, HotelController.getHotelsByOwner);
HotelRouter.put("/update-hotel/:hotelId", checkOwner, HotelController.updateHotelInfo);
HotelRouter.put("/updateStatusService/:hotelId/status", HotelController.updateHotelServiceStatus);
HotelRouter.post("/add-service", HotelController.createHotelService);
HotelRouter.put("/changeStatus-hotel/:hotelId", checkOwner, HotelController.changeStatusHotelInfo);
HotelRouter.post("/create-hotel", checkOwner, HotelController.createHotel);

HotelRouter.post(
  "/upload_images",
  checkOwner,
  upload.array("images", 5), // Accept exactly 5 files with field name 'images'
  HotelController.uploadHotelImages
);

// Delete hotel images
HotelRouter.delete("/delete_images", checkOwner, HotelController.deleteHotelImages);

HotelRouter.get("/get-top-hotel-location", HotelController.getTop5HotelsByLocation);

module.exports = HotelRouter;
