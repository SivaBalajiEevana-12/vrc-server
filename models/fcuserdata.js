const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true, // ensure only one volunteer per phone
  },
  status: {
    type: String,
    enum: ["Present", "Absent"],
    default: null, // 👈 no status on initial creation
  },
  date: {
    type: Date,
    default: null, // date added when status is set
  }
}, { timestamps: true });

module.exports = mongoose.model("FlcAttendance", attendanceSchema);
