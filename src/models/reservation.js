const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;

const reservationSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    rooms: [
      {
        _id: false,
        room: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Room",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "BOOKED",
        "CHECKED IN",
        "CHECKED OUT",
        "COMPLETED",
        "PENDING",
        "CANCELLED",
        "NOT PAID",
      ],
      default: "PENDING",
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false }
);



module.exports = mongoose.model("Reservation", reservationSchema);
