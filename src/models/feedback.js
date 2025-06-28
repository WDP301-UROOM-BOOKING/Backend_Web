const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.Number, ref: "User", required: true }, // User ID
    reservation: {
      type: Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    }, 
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    }, // Hotel ID
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    createdAt: { type: Date, default: Date.now },
    likedBy: [{ 
      type: mongoose.Schema.Types.Number, 
      ref: "User" 
    }],
    dislikedBy: [{ 
      type: mongoose.Schema.Types.Number, 
      ref: "User" 
    }],
    statusActive: {
      type: String,
      enum: ["ACTIVE", "NONACTIVE"],
      default: "ACTIVE"
    },
  },
  { versionKey: false }
);



module.exports = mongoose.model("Feedback", FeedbackSchema);
