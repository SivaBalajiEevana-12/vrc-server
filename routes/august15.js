const express = require('express');
const router = express.Router();
const crypto = require('crypto');
// const razorpay = require('razorpay'); // <-- Replace with your actual Razorpay instance
const Candidate = require('../models/candidate');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// Your Mongoose model
// const gupshup = require('./gupshup'); // Assuming you have a wrapper for Gupshup
// Create Razorpay order
router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount, // in paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ status: "error", message: "Failed to create order" });
  }
});

// Verify payment and save candidate
router.post("/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    formData,
  } = req.body;

  // Signature Verification
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generated_signature = hmac.digest("hex");

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ status: "fail", message: "Payment verification failed" });
  }

  try {
    const normalizedNumber = "91" + formData.whatsappNumber;

    const newCandidate = new Candidate({
      serialNo: formData.serialNo,
      name: formData.name,
      gender: formData.gender,
      college: formData.collegeName,
      course: formData.course,
      year: formData.year,
      dob: new Date(formData.dob),
      registrationDate: new Date(), // default to now
      whatsappNumber: normalizedNumber,

      // Payment fields
      paymentStatus: "Paid",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentAmount: parseFloat(formData.amount), // paise or rupees — ensure consistency
      paymentDate: new Date(),
      paymentMethod: formData.paymentMethod || "Online", // optional
      receipt: formData.receipt || `receipt_${Date.now()}`
    });

    await newCandidate.save();
    console.log(newCandidate);

    // Send WhatsApp Message via Gupshup
    // gupshup.sendingTextTemplate({
    //   template: {
    //     id: '3439dc99-4784-4733-9038-f810b98df077',
    //     params: [newCandidate.name, "https://chat.whatsapp.com/BgKZOANIvI0JSuBWStpyf2"]
    //   },
    //   'src.name': 'Production',
    //   destination: normalizedNumber,
    //   source: '917075176108',
    // }, {
    //   apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38'
    // }).then(({ data }) => {
    //   console.log("WhatsApp message sent:", data);
    //   res.status(200).json({ status: "success", message: "Payment verified and candidate registered" });
    // }).catch(err => {
    //   console.error("Gupshup error:", err.response?.data || err);
    //   res.status(500).json({ status: "error", message: "Payment saved, but WhatsApp failed" });
    // });

  } catch (err) {
    console.error("Error saving candidate:", err);
    res.status(500).json({ status: "error", message: "Registration failed" });
  }
});
router.get('/data', async (req, res) => {
  try {
    const data = await Candidate.find();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching candidate data:", err);
    res.status(500).json({ status: "error", message: "Failed to fetch data" });
  }
});


module.exports = router;
