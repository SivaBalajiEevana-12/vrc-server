const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer",
    required: true,
  },
  date: {
    type: Date,
    default:Date.now //current date 
  },
  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("ManualAttendance", attendanceSchema);
