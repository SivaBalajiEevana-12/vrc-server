const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now, // ✅ current date-time
  },
  status: {
    type: String,
    enum: ["Present"],
    default: "Present",
    required: true,
  },
  remarks: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});
