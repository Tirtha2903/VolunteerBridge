const express = require('express');
const router = express.Router();

let Volunteer;
try { Volunteer = require('../models/Volunteer'); } catch (e) { Volunteer = null; }

const mockVolunteers = [
  { _id: '1', name: 'Aisha Sharma', skills: ['cooking', 'logistics'], area: 'Riverside District', availability: true, phone: '9876543210', email: 'aisha@example.com', createdAt: new Date() },
  { _id: '2', name: 'Rohan Mehta', skills: ['first aid', 'nursing'], area: 'North Quarters', availability: true, phone: '9876543211', email: 'rohan@example.com', createdAt: new Date() },
  { _id: '3', name: 'Priya Verma', skills: ['teaching', 'tutoring'], area: 'Central Shelter Zone', availability: true, phone: '9876543212', email: 'priya@example.com', createdAt: new Date() },
  { _id: '4', name: 'Amit Kumar', skills: ['construction', 'carpentry'], area: 'West Colony', availability: true, phone: '9876543213', email: 'amit@example.com', createdAt: new Date() },
  { _id: '5', name: 'Sunita Rao', skills: ['driving', 'logistics'], area: 'South End', availability: false, phone: '9876543214', email: 'sunita@example.com', createdAt: new Date() },
];

// GET all volunteers
router.get('/', async (req, res) => {
  try {
    if (!Volunteer || mongoose_not_connected()) return res.json(mockVolunteers);
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (err) {
    res.json(mockVolunteers);
  }
});

// POST register volunteer
router.post('/', async (req, res) => {
  try {
    if (!Volunteer || mongoose_not_connected()) {
      const fake = { ...req.body, _id: Date.now().toString(), availability: true, createdAt: new Date() };
      return res.status(201).json(fake);
    }
    const volunteer = new Volunteer(req.body);
    await volunteer.save();
    res.status(201).json(volunteer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update volunteer (availability, assignment)
router.put('/:id', async (req, res) => {
  try {
    if (!Volunteer || mongoose_not_connected()) return res.json({ ...req.body, _id: req.params.id });
    const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    res.json(volunteer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE volunteer
router.delete('/:id', async (req, res) => {
  try {
    if (!Volunteer || mongoose_not_connected()) return res.json({ message: 'Deleted (mock)' });
    await Volunteer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Volunteer deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

function mongoose_not_connected() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState !== 1;
  } catch { return true; }
}

module.exports = router;
