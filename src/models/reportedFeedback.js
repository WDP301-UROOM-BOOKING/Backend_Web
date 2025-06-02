const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReportedFeedbackSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.Number,
      ref: "User",
      required: true,
    }, // User ID
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECT"],
      default: "PENDING",
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("ReportedFeedback", ReportedFeedbackSchema);
