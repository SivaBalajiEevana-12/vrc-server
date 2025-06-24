const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  dateDisplay: {
    type: String,
    required: true
  },
  timeDisplay: {
    type: String,
    required: true
  },
  cronDate: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    default: "Vizag"
  },
  locationLink: {
    type: String,
    required: true
  },
  sentOneDayReminder:{
    type:Boolean,
    default:false
  }
});

module.exports = mongoose.model('Event', eventSchema);
