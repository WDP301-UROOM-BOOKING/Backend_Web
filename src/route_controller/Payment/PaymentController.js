require("dotenv").config();
const asyncHandler = require("../../middlewares/asyncHandler");
const Reservation = require("../../models/reservation");
const RoomAvailability = require("../../models/roomAvailability");
const Room = require("../../models/room");
const mongoose = require("mongoose");
const room = require("../../models/room");

//Create booking with not paid reservation
exports.createBooking = asyncHandler(async (req, res) => {
  const user = req.user;
  const { hotelId, checkInDate, checkOutDate, roomDetails, totalPrice } =
    req.body.params;

  try {
    if (!user._id || !hotelId || !checkInDate || !checkOutDate) {
      return res
        .status(400)
        .json({ error: true, message: "Missing required fields" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    console.log("checkIn: ", checkIn);
    console.log("checkOut: ", checkOut);

    //Check not paid reservation
    const unpaidReservation = await Reservation.findOne({
      user: user._id,
      status: "NOT PAID",
    });

    if (unpaidReservation) {
      return res.json({
        unpaidReservation: unpaidReservation,
        message:
          "You must payment the not paid reservation before or wait 5 minutes to delete",
      });
    }

    for (let room of roomDetails) {
      console.log("room: ", room);
      const roomFind = await Room.findById(room.room._id);
      console.log("Id: ", room.room._id);

      // First, find all bookings that overlap with the requested period
      const overlappingBookings = await RoomAvailability.find({
        room: new mongoose.Types.ObjectId(room.room._id),
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gt: checkIn },
      });

      // Process the overlapping bookings to determine the maximum occupancy
      let maxBookedQuantity = 0;
      let dateMap = new Map();

      // Create a map of all dates in the range and their booked quantities
      for (const booking of overlappingBookings) {
        // Get all dates between checkIn and checkOut for this booking
        let currentDate = new Date(Math.max(booking.checkInDate, checkIn));
        const endDate = new Date(Math.min(booking.checkOutDate, checkOut));

        while (currentDate < endDate) {
          const dateStr = currentDate.toISOString().split("T")[0];
          const currentBooked = dateMap.get(dateStr) || 0;
          dateMap.set(dateStr, currentBooked + booking.bookedQuantity);

          // Move to next day
          currentDate.set;
          Date(currentDate.getDate() + 1);
        }
      }

      // Find the maximum booked quantity for any day in the range
      for (const bookedQuantity of dateMap.values()) {
        maxBookedQuantity = Math.max(maxBookedQuantity, bookedQuantity);
      }

      console.log("roomFind quantity: ", roomFind.quantity);
      console.log("maxBookedQuantity: ", maxBookedQuantity);
      console.log("requested quantity: ", room.amount);

      // Check if the requested amount exceeds available capacity
      if (room.amount > roomFind.quantity - maxBookedQuantity) {
        return res.status(400).json({
          error: true,
          message:
            "Failed to create reservation. Not enough rooms available for the selected dates.",
        });
      }
    }

    // Tạo đơn đặt phòng
    const reservation = new Reservation({
      user: user._id,
      hotel: hotelId,
      rooms: roomDetails.map((item) => ({
        room: item.room._id,
        quantity: item.amount,
      })),
      checkInDate,
      checkOutDate,
      totalPrice,
      status: "NOT PAID",
    });
    reservation.save();

    for (let room of roomDetails) {
      const roomAvailability = new RoomAvailability({
        room: room.room._id,
        checkInDate,
        checkOutDate,
        bookedQuantity: room.amount,
        reservation: reservation._id,
      });
      roomAvailability.save();
    }

    return res.status(201).json({
      error: false,
      message:
        "Reservation created successfully. Please finish payment in 5 minutes",
      reservation,
    });
  } catch (err) {
    console.log(err.message);
    return res
      .status(500)
      .json({ error: true, message: "Failed to create reservation" });
  }
});

exports.cancelPayment = asyncHandler(async (req, res) => {
  const { reservationId } = req.body;
  const userId = req.user.id;

  try {
    const reservation = await Reservation.findById(reservationId).populate(
      "hotel"
    );

    if (!reservation) {
      return res.status(404).json({
        error: true,
        message: "Reservation not found",
      });
    }

    // Kiểm tra nếu reservation đã bị hủy rồi
    if (reservation.status === "CANCELLED") {
      return res.status(400).json({
        error: true,
        message: "Reservation is already cancelled",
      });
    } else {
      try {
        const result = await RoomAvailability.deleteMany({
          reservation: reservationId,
        });
        console.log(
          `Đã xóa ${result.deletedCount} bản ghi RoomAvailability với reservationId = ${reservationId}`
        );
      } catch (error) {
        console.error(
          "Lỗi khi xóa RoomAvailability theo reservationId:",
          error
        );
      }
      reservation.status = "CANCELLED";
      reservation.save();
    }

    return res.status(200).json({
      error: false,
      message: "Reservation cancelled successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      message: "Failed to cancel reservation",
    });
  }
});

exports.acceptPayment = asyncHandler(async (req, res) => {
  const { reservationId } = req.body;
  const userId = req.user.id;

  try {
    const reservation = await Reservation.findById(reservationId).populate(
      "hotel"
    );

    if (!reservation) {
      return res.status(404).json({
        error: true,
        message: "Reservation not found",
      });
    }

    // Kiểm tra nếu reservation đã bị hủy rồi
    if (reservation.status === "CANCELLED") {
      return res.status(400).json({
        error: true,
        message: "Reservation is already cancelled",
      });
    }

    if (reservation.status === "NOT PAID") {
      reservation.status = "PENDING";
      reservation.save();
    }

    return res.status(200).json({
      error: false,
      message: "Reservation cancelled successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: true,
      message: "Failed to cancel reservation",
    });
  }
});

// Lấy danh sách reservation theo filter
exports.getReservations = asyncHandler(async (req, res) => {
  try {
    const { status, month, year, sort = "desc" } = req.query;
    const userId = req.user._id;

    // Filter reservations where the hotel's owner is the current user
    const hotels = await mongoose
      .model("Hotel")
      .find({ owner: userId })
      .select("_id");
    const hotelIds = hotels.map((h) => h._id);

    let filter = {};
    filter.hotel = { $in: hotelIds };
    if (status) filter.status = status;
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      filter.createdAt = { $gte: start, $lt: end };
    } else if (year) {
      // Lọc theo năm
      const start = new Date(year, 0, 1);
      const end = new Date(Number(year) + 1, 0, 1);
      filter.createdAt = { $gte: start, $lt: end };
    }
    console.log("re filter: ", filter);
    const reservations = await Reservation.find(filter)
      .sort({ createdAt: sort === "asc" ? 1 : -1 })
      .populate("hotel")
      .populate("user")
      .populate("rooms.room");
    console.log("re: ", reservations);
    res.json({ error: false, reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Failed to get reservations" });
  }
});
