const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectVolunteer",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Present", "Absent"],
      required: true,
    },
    type: {
      type: String,
      enum: ["meetup", "seva"],
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index(
  { volunteer: 1, date: 1, project: 1, type: 1 },
  { unique: true }
);

module.exports = mongoose.model("ProjectManualAttendance", attendanceSchema);
