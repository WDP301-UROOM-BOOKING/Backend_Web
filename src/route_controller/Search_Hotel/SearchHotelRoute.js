const express = require("express");
const SearchHotelRoute = express.Router();
const SearchController = require("./SearchHotelController");
const checkGuest = require("../../middlewares/cheskGuest");

SearchHotelRoute.get("/",checkGuest, SearchController.searchAndFilterHotels);

module.exports = SearchHotelRoute;