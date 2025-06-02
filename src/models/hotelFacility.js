const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;

const HotelFacilitySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    icon: {type: String},
  },
  { versionKey: false }
);



module.exports = mongoose.model("HotelFacility", HotelFacilitySchema);
