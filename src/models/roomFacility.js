const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;

const RoomFacilitySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    icon: {type: String},
  },
  { versionKey: false }
);


module.exports = mongoose.model("RoomFacility", RoomFacilitySchema);
