const express = require("express");
const roomController = require("./RoomController");
const checkOwner = require("../../middlewares/checkOwner");
const upload = require("../../middlewares/uploadMiddleware");

const Roomrouter = express.Router();

Roomrouter.get("/rooms_information/:hotelId", roomController.getRoomsByHotel);
Roomrouter.get("/rooms_detail/:roomId", roomController.getRoomById);
Roomrouter.get("/list_room/:hotelId", roomController.getRoomByHotelIdOfOwner);
Roomrouter.post('/upload_images', checkOwner, upload.array('images', 5), roomController.uploadRoomImages);
Roomrouter.delete("/delete_images", checkOwner, roomController.deleteRoomImages);
Roomrouter.post("/create-room", checkOwner, roomController.createRoom);
Roomrouter.put("/update-room/:roomId", checkOwner, roomController.updateRoom);
Roomrouter.put("/change-status-room/:roomId", checkOwner, roomController.changeStatusRoom);

module.exports = Roomrouter;
