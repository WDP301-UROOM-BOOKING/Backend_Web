const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const RoomAvailabilitySchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    checkInDate: { type: Date, required: true},
    checkOutDate: { type: Date, required: true},    
    bookedQuantity: { type: Number, default: 0 },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation", required: true },
  },
  { versionKey: false }
);

module.exports = mongoose.model("RoomAvailability", RoomAvailabilitySchema);
