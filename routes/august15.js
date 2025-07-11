const express = require('express');
const router = express.Router();
const crypto = require('crypto');
// const razorpay = require('razorpay'); // <-- Replace with your actual Razorpay instance
const Candidate = require('../models/candidate');
const Razorpay = require('razorpay');
const gupshup=require('@api/gupshup');

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

  
    const message = await gupshup.sendingTextTemplate(
      {
        template: {
          id: '868b6c27-b39a-4689-9def-261a5527d3dc',
          params: [newCandidate.name],
        },
        'src.name': 'Production',
        destination: normalizedNumber,
        source: '917075176108',
      },
      {
        apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
      }
    );
    console.log(message.data);

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
// Mark attendance by WhatsApp number
router.post("/attendance/:phone", async (req, res) => {
  try {
    const phone = "91" + req.params.phone;

    const candidate = await Candidate.findOne({ whatsappNumber: phone });

    if (!candidate) {
      return res.status(404).json({ status: "error", message: "Candidate not found" });
    }

    if (candidate.attendance) {
      return res.status(200).json({ status: "info", message: "Already marked as attended" });
    }

    candidate.attendance = true;
    await candidate.save();

    res.status(200).json({ status: "success", message: "Attendance marked successfully" });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ status: "error", message: "Failed to mark attendance" });
  }
});
// POST /mark-attendance
router.post("/mark-attendance", async (req, res) => {
  const { whatsappNumber } = req.body;
  const fullNumber = "91" + whatsappNumber;

  try {
    const candidate = await Candidate.findOneAndUpdate(
      { whatsappNumber: fullNumber },
      { attendance: true },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
        const message = await gupshup.sendingTextTemplate(
      {
        template: {
          id: '868b6c27-b39a-4689-9def-261a5527d3dc',
          params: [candidate.name],
        },
        'src.name': 'Production',
        destination: fullNumber,
        source: '917075176108',
      },
      {
        apikey: 'zbut4tsg1ouor2jks4umy1d92salxm38',
      }
    );
    console.log(message.data);

    res.json({ status: "success", name: candidate.name });
  } catch (err) {
    console.error("Attendance marking error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// GET all candidates who have marked attendance
router.get("/attendance-list", async (req, res) => {
  try {
    const attendedCandidates = await Candidate.find({ attendance: true });
    res.status(200).json(attendedCandidates);
  } catch (err) {
    console.error("Error fetching attendance list:", err);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
