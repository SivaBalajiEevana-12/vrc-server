const mongoose = require("mongoose");

const Service = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  }
})
module.exports=mongoose.model("service",Service)
