const express = require('express');
const router = express.Router();
const Volunteer = require('../models/volunteerform');


router.post('/api/volunteers', async (req, res) => {
  try {
    const volunteer = new Volunteer(req.body);
    await volunteer.save();
    res.status(201).json({ message: 'Volunteer registered successfully', volunteer });
  } catch (error) {
    console.error('Error registering volunteer:', error);
    res.status(400).json({ message: 'Error registering volunteer', error: error.message });
  }
});


router.get('/api/volunteers', async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.status(200).json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/api/volunteers/:whatsappNumber', async (req, res) => {
  const { whatsappNumber } = req.params;

  try {
    const volunteer = await Volunteer.findOne({ whatsappNumber });
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    res.status(200).json(volunteer);
  } catch (error) {
    console.error('Error fetching volunteer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.delete('/api/volunteers', async (req, res) => {
  try {
    const result = await Volunteer.deleteMany({});
    res.status(200).json({ message: 'All volunteer records deleted', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting volunteers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
