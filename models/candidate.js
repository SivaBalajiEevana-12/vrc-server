 const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  serialNo: { type: Number },
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  college: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: Number, required: true },
  dob: { type: Date },
  registrationDate: { type: Date, default: Date.now },
  whatsappNumber: { type: String, required: true },

  // Razorpay payment fields
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  paymentId: { type: String },
  orderId: { type: String },
  paymentAmount: { type: Number, required: true },
  paymentDate: { type: Date },
  paymentMethod: { type: String },
  receipt: { type: String },

  // Reminder tracking
  remindersSent: {
    threeDay: { type: Boolean, default: false },
    twoDay: { type: Boolean, default: false },
    oneDay: { type: Boolean, default: false },
    twoHour: { type: Boolean, default: false },
  },

  // ✅ New attendance field
  attendance: { type: Boolean, default: false },
});

module.exports = mongoose.model('Candidate', candidateSchema);
