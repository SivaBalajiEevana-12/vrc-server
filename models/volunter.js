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
    type: String, // Can be changed to enum later if types are known
    default: "",  // Or you can omit this to allow `undefined`
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Volunteer", volunteerSchema);
