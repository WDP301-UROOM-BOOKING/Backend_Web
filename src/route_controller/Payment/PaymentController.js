require("dotenv").config();
const asyncHandler = require("../../middlewares/asyncHandler");
const Reservation = require("../../models/reservation");
const RoomAvailability = require("../../models/roomAvailability");
const Room = require("../../models/room");
const mongoose = require("mongoose");
const room = require("../../models/room");
const HotelService = require("../../models/hotelService");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

// Constants for booking statuses and messages
const COMPLETED_BOOKING_STATUS = "COMPLETED";
const NOT_PAID_BOOKING_STATUS = "NOT_PAID";
const NOT_FOUND_RESERVATION_MESSAGE = "Reservation not found";
const webhookKey = process.env.STRIPE_WEBHOOK_SECRET;

//Create booking with not paid reservation
exports.createBooking = asyncHandler(async (req, res) => {
  const user = req.user;
  const {
    hotelId,
    checkInDate,
    checkOutDate,
    roomDetails,
    serviceDetails,
    totalPrice,
    finalPrice, // nhận thêm finalPrice
    promotionId, // nhận thêm promotionId
    promotionDiscount // nhận thêm promotionDiscount
  } = req.body.params;

  console.log("roomdetails: ", roomDetails);

  console.log("serviceDetails: ", serviceDetails);
  try {
    if (!user._id || !hotelId || !checkInDate || !checkOutDate) {
      return res
        .status(400)
        .json({ error: true, message: "Missing required fields" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

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
          // currentDate.set;
          // Date(currentDate.getDate() + 1);

          // Thinh update createbooking START 16/06/2025
          currentDate.setDate(currentDate.getDate() + 1);

          // Thinh update createbooking END 16/06/2025
        }
      }
      // Find the maximum booked quantity for any day in the range
      for (const bookedQuantity of dateMap.values()) {
        console.log("bookedQuantity >> ", bookedQuantity);
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

    // Create new reservation
    const reservation = new Reservation({
      user: user._id,
      hotel: hotelId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalPrice: totalPrice,
      finalPrice: finalPrice, // lưu finalPrice
      promotionId: promotionId || null, // lưu promotionId nếu có
      promotionDiscount: promotionDiscount || 0, // lưu promotionDiscount nếu có
      rooms: roomDetails.map(({ room, amount }) => ({
        room: room._id,
        quantity: amount,
      })),
      services:
        serviceDetails?.map((service) => ({
          service: service._id,
          quantity: service.quantity,
          selectDate: service.selectDate,
        })) || [],
      status: "NOT PAID",
    });

    await reservation.save();

    // Update room availability
    for (const { room, amount } of roomDetails) {
      const roomAvailability = new RoomAvailability({
        room: room._id,
        reservation: reservation._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        bookedQuantity: amount,
      });
      await roomAvailability.save();
    }

    return res.status(201).json({
      message: "Create booking successfully",
      reservation: reservation,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({
      error: true,
      message: "Error creating booking",
    });
  }
});

// Thinh update stripe payment START 13/06/2025

exports.checkoutBooking = asyncHandler(async (req, res) => {
  const { reservationId } = req.body;
  console.log("reservationId: ", reservationId);
  try {
    const reservation = await Reservation.findById(reservationId)
      .populate("hotel")
      .populate("rooms.room");

    if (!reservation) {
      return res
        .status(404)
        .json({ error: true, message: "Reservation not found" });
    }

    if (reservation.status !== "NOT PAID") {
      return res.status(400).json({
        error: true,
        message: "Reservation is not in a 'NOT PAID' status.",
      });
    }

    // --- FIX FOR CYCLIC OBJECT VALUE ERROR ---
    // Instead of logging the entire Mongoose document directly,
    // convert it to a plain JavaScript object first, or select specific fields.

    // Prepare line items for Stripe (this part of your code seems fine for Stripe)
    const lineItems = reservation.rooms.map((roomItem) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: reservation.hotel.name,
          },
          unit_amount: Math.round(
            (reservation.totalPrice * 100) / reservation.rooms.length
          ),
        },
        quantity: roomItem.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: reservation.hotel.hotelName,
            },
            unit_amount: Math.round((reservation.finalPrice || reservation.totalPrice) * 100), // Ưu tiên finalPrice
          },
          quantity: 1,
        },
      ],
      metadata: {
        reservationId: reservationId.toString(),
      },
      success_url: `http://localhost:3000/payment_success?reservationId=${reservationId}&totalPrice=${reservation.finalPrice || reservation.totalPrice}`,
      cancel_url: `http://localhost:3000/payment_failed?reservationId=${reservationId}`,
    });

    return res.status(200).json({
      error: false,
      message: "Stripe checkout session created successfully",
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (err) {
    console.error("Error creating Stripe checkout session:", err); // This catch block will now likely give you a more helpful error if it's not the console.log line
    return res
      .status(500)
      .json({
        error: true,
        message: "Failed to create Stripe checkout session",
      });
  }
});
// Thinh update stripe payment END 13/06/2025

// Thinh create webhook
exports.stripeWebhookHandler = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // Ensure your Express app uses `express.raw()` or a similar body parser for Stripe webhooks
      sig,
      webhookKey // Your Stripe webhook secret
    );
  } catch (err) {
    console.error(`⚠️  Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      await confirmPayment(event);
      break;
    case "checkout.session.async_payment_failed":
    case "checkout.session.expired": // Consider handling expired sessions as well
      await cancelPayment(event);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

async function confirmPayment(event) {
  console.log("payment success");
  const session = event.data.object;
  const reservationId = session.metadata.reservationId;

  try {
    const reservation = await Reservation.findById(reservationId).populate(
      "user"
    ); // Populate user to get email
    if (!reservation) {
      throw new Error(NOT_FOUND_RESERVATION_MESSAGE);
    }

    // phần code thay đoỉ sau khi thanh toán
    reservation.status = COMPLETED_BOOKING_STATUS;
    await reservation.save();

    // Send email confirmation
    if (reservation.user && reservation.user.email) {
      const userEmailConfirmedBooking = reservation.user.email;
      // Assuming you have a utility function to build the booking response for the email
      // and a sendEmail service
      const subject = "Booking Confirmed!"; // Use a constant or define appropriately
      const bookingDetailsForEmail = {
        // Simplified for example, adjust based on your needs
        hotelName: reservation.hotel.hotelName,
        totalPrice: reservation.finalPrice || reservation.totalPrice, // ưu tiên finalPrice nếu có
        // Add other relevant details
      };
      await sendEmail(
        userEmailConfirmedBooking,
        subject,
        `Your booking for ${bookingDetailsForEmail.hotelName} has been confirmed. Total price: $${bookingDetailsForEmail.totalPrice}.`
      );
    } else {
      console.warn(
        `User email not found for reservation ID: ${reservationId}. Cannot send confirmation email.`
      );
    }

    console.log(`Reservation ${reservationId} confirmed successfully.`);
  } catch (error) {
    console.error(
      `Error confirming payment for reservation ${reservationId}:`,
      error.message
    );
    // You might want to log this error to a more robust logging system or
    // implement a retry mechanism for failed email sending.
  }
}

// async function cancelPayment(event) {
//   console.log('payment cancel')
//   const session = event.data.object;
//   const reservationId = session.metadata.reservationId;

//   try {
//     const reservation = await Reservation.findById(reservationId);
//     if (!reservation) {
//       throw new Error(NOT_FOUND_RESERVATION_MESSAGE);
//     }

//     // phần code thay đoỉ sau khi cancel thanh toán
//     reservation.status = NOT_PAID_BOOKING_STATUS; // Or a specific 'CANCELED' status if preferred
//     await reservation.save();
//     console.log(`Reservation ${reservationId} status changed to ${PENDING_BOOKING_STATUS}.`);
//   } catch (error) {
//     console.error(`Error canceling payment for reservation ${reservationId}:`, error.message);
//   }
// }
// Thinh create webhook

exports.cancelPayment = asyncHandler(async (req, res) => {
  const { reservationId } = req.body;
  console.log("reservationId: ", reservationId);
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
    res
      .status(500)
      .json({ error: true, message: "Failed to get reservations" });
  }
});
