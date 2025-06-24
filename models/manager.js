const mongoose = require("mongoose");

const volunteer1Schema = new mongoose.Schema({
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
  location:{
    type: String,
    required: true,
    trim: true,

  },
  reportingTime:{
   type: String,
    required: true,
    trim: true,
  }
})

module.exports = mongoose.model("Manager", volunteer1Schema);
