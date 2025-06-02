const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { Schema } = mongoose;

const HotelServiceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      required: true,
    },
    statusActive: {
      type: String,
      enum: ["ACTIVE", "NONACTIVE"],
      default: "NONACTIVE"
    },
  },
  { versionKey: false }
);



module.exports = mongoose.model("HotelService", HotelServiceSchema);
