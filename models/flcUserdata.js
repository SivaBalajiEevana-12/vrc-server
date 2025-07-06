const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  whatsappNumber: {
    type: String,
    required: true
  },
  profession: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: false
  },
  age: {
    type: Number,
    required: false
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: false
  },
  location: {
    type: String,
    required: false
  },
  attendance: {
    type: String,
    enum: ['Present', 'Absent'],
    default: 'Absent'
  }
});

module.exports = mongoose.model('Response', ResponseSchema);
