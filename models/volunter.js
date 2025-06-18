const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema({
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
    enum: ["yes", "no"],
   
  },
  gender: {
    type: String,
    enum: ["male", "female"],
   
  },
  currentLocality: {
    type: String,
    
    trim: true,
  },
  serviceAvailability: {
    type: String,
    enum: ["6am-9am", "9am-6pm", "6pm-9pm"],
    required: true,
  },
  serviceType: {
    type: String, // Can be changed to enum later if types are known
    default: "",  // Or you can omit this to allow `undefined`
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Volunteer", volunteerSchema);
