const mongoose = require("mongoose");

const volunteerSchema12 = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  whatsappNumber: {
    type: String,
    required: true,
    trim: true,
  },
  collegeCompany: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
    min: 10,
    max: 120,
  },
  previousVolunteer: {
    type: String,
  },
  gender: {
    type: String,
  },
  currentLocality: {
    type: String,
    trim: true,
  },
  serviceAvailability: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    default: "",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // Must match the model name
    required: true, // Optional depending on if every volunteer must be assigned
  },
});

module.exports = mongoose.model("ProjectVolunteer", volunteerSchema12);
