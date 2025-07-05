const mongoose = require("mongoose");

const attendanceSchema12 = new mongoose.Schema({
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
attendanceSchema12.index({ volunteer: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("JulyManualAttendance", attendanceSchema12);
