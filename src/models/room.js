const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const RoomSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    quantity: { type: Number, required: true },
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    bed: [
      {
        _id: false,
        bed: { type: Schema.Types.Number, ref: 'Bed', required: true },
        quantity: { type: Number, required: true },
      },
    ],
    facilities: [{ type: Schema.Types.ObjectId, ref: 'RoomFacility' }],
    statusActive: {
      type: String,
      enum: ["ACTIVE", "NONACTIVE"],
      default: "NONACTIVE"
    },
  },
  { versionKey: false }
);



module.exports = mongoose.model('Room', RoomSchema);
