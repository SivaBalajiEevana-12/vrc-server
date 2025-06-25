const mongoose = require("mongoose");

const volunteerAttendanceSchema = new mongoose.Schema({
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer",
    required: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  qrUrl: {
    type: String,
    trim: true,
    default: "",
  },
  verified: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    
    default: () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Normalize to today's midnight
      return now;
    },
  },
  status: {
    type: String,
    enum: ["Present","Absent"],
    default: "Absent",
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("VolunteerAttendance", volunteerAttendanceSchema);
