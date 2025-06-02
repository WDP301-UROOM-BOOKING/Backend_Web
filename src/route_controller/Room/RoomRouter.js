const express = require("express");
const roomController = require("./RoomController");

const Roomrouter =  express.Router();

Roomrouter.get("/rooms_information/:hotelId", roomController.getRoomsByHotel);
Roomrouter.get('/rooms_detail/:roomId', roomController.getRoomById);

module.exports = Roomrouter; 
