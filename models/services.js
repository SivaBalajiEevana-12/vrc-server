const mongoose = require("mongoose");

const Service = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  reportingTime: {
    type: String,
    default: "00:00",
    trim: true,
  },
})
module.exports=mongoose.model("service",Service)
