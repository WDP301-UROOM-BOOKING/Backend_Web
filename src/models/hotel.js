const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;

const hotelSchema = new Schema(
  {
    hotelName: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      default: "0905123456",
    },
    email: {
      type: String,
      required: true,
      default: "DaNangLunVuiTUoi@hotel.com",
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HotelService",
      },
    ],
    facilities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HotelFacility",
      },
    ],
    rating: {
      type: Number,
      required: true,
    },
    star: {
      type: Number,
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    images: [
      {
        public_ID: {
          type: String,
          default: "avatar_default",
        },
        url: {
          type: String,
          default:
            "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg",
        },
      },
    ],
    businessDocuments: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    adminStatus: {
      type: String,
      enum: ["PENDING", "APPROVED"],
      default: "PENDING",
    },
    ownerStatus: {
      type: String,
      enum: ["ACTIVE", "NONACTIVE"],
      default: "NONACTIVE",
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    decisionDate: {
      type: Date,
    },
    checkInStart: {
      type: String,
      default: "12:00",
    },
    checkInEnd: {
      type: String,
      default: "13:00",
    },
    checkOutStart: {
      type: String,
      default: "10:00",
    },
    checkOutEnd: {
      type: String,
      default: "11:00",
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Hotel", hotelSchema);
