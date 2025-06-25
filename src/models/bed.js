const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const bedSchema = new mongoose.Schema(
  {
    _id: {
      type: Number
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { 
    versionKey: false,
    _id: false // Disable automatic ObjectId generation
  }
);

// Add auto-increment plugin starting from 0
bedSchema.plugin(AutoIncrement, { 
  id: 'bed_seq',
  inc_field: '_id',
  start_seq: 1
});

module.exports = mongoose.model("Bed", bedSchema);