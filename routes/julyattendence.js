const express = require('express');
const router = express.Router();
const JulyManualAttendance=require('../models/manualvibava');
const Manager = require('../models/manager');
const Volunteer = require('../models/volunter');
router.get('/api/attendance', async (req, res) => {
  try {
    const records = await JulyManualAttendance.find().populate('volunteer');
    // const records = await Volunteer.find({ serviceType: "" })
      // .populate({
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.get('/user/:whatsappNumber',async (req,res)=>{
  const { whatsappNumber } = req.params;

  try {
    const user = await Volunteer.findOne({ whatsappNumber });
    const manager = await Manager.findOne({ serviceType: user.serviceType });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({user,manager});
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
})
router.get('/attendence/:whatsappNumber', async (req, res) => {
  const { whatsappNumber } = req.params;

  try {
    // Exclude serviceType field using projection
    const user = await Volunteer.findOne({ whatsappNumber }, { serviceType: 0, serviceAvailability: 0  });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post('/manual-attendance', async (req, res) => {
  const { volunteerId, status } = req.body;

  if (!["Present", "Absent"].includes(status)) {
    return res.status(400).json({ message: "Invalid attendance status." });
  }

  try {
    // Check if attendance already exists for this volunteer
    const existing = await JulyManualAttendance.findOne({ volunteer: volunteerId });

    if (existing) {
      return res.status(409).json({ message: "Attendance already submitted." });
    }

    // Save attendance
    const attendance = new JulyManualAttendance({
      volunteer: volunteerId,
      status
    });

    await attendance.save();
    res.status(200).json({ message: "Attendance saved." });

  } catch (err) {
    console.error("Manual attendance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;