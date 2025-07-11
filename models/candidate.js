const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  serialNo: { type: Number},
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  college: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: Number, required: true },
  dob: { type: Date},
  registrationDate: { type: Date, default: Date.now },
  whatsappNumber: { type: String, required: true },

  // Razorpay payment fields
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  paymentId: { type: String }, // Razorpay Payment ID
  orderId: { type: String },   // Razorpay Order ID
  paymentAmount: { type: Number, required: true }, // In smallest currency unit (e.g., paise)
  paymentDate: { type: Date },
  paymentMethod: { type: String }, // e.g. "UPI", "Card", "Netbanking"
  receipt: { type: String } // Optional Razorpay receipt ID
});

module.exports = mongoose.model('Candidate', candidateSchema);
