const mongoose = require("mongoose");

const managerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  serviceType: {
    type: String,
    trim: true,
  },
  link: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  reportingTime: {
    type: String,
    required: true,
    trim: true,
  },

  // 👇 Project reference
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true, // Make true if a manager must belong to a project
  },
});

module.exports = mongoose.model("ProjectManager", managerSchema);
