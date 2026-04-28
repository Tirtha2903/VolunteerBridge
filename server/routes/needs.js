const express = require('express');
const router = express.Router();

let Need;
try { Need = require('../models/Need'); } catch (e) { Need = null; }

// Mock data fallback (when no DB)
const mockNeeds = [
  { _id: '1', title: 'Emergency food kits for flood-affected families', area: 'Riverside District', category: 'Food', urgency: 5, volunteersNeeded: 8, description: 'Severe flooding has displaced 200+ families.', reportedBy: 'Field Team Alpha', status: 'Open', createdAt: new Date() },
  { _id: '2', title: 'Medical aid — diabetic medication shortage', area: 'North Quarters', category: 'Medical', urgency: 5, volunteersNeeded: 4, description: 'Critical shortage of insulin.', reportedBy: 'Dr. Priya Nair', status: 'Open', createdAt: new Date() },
  { _id: '3', title: 'After-school tutoring for displaced children', area: 'Central Shelter Zone', category: 'Education', urgency: 3, volunteersNeeded: 6, description: 'Educational support in relief camps.', reportedBy: 'NGO EduReach', status: 'Open', createdAt: new Date() },
  { _id: '4', title: 'Temporary shelter repair after storm', area: 'West Colony', category: 'Shelter', urgency: 4, volunteersNeeded: 10, description: 'Storm damaged 30 tin-roof homes.', reportedBy: 'Community Leader Raju', status: 'In Progress', createdAt: new Date() },
  { _id: '5', title: 'Clean water distribution — contamination alert', area: 'South End', category: 'Food', urgency: 4, volunteersNeeded: 5, description: 'Well contamination confirmed.', reportedBy: 'Health Inspector', status: 'Open', createdAt: new Date() },
];

// GET all needs
router.get('/', async (req, res) => {
  try {
    if (!Need || mongoose_not_connected()) return res.json(mockNeeds.sort((a, b) => b.urgency - a.urgency));
    const needs = await Need.find().sort({ urgency: -1, createdAt: -1 });
    res.json(needs);
  } catch (err) {
    res.json(mockNeeds);
  }
});

// POST create need
router.post('/', async (req, res) => {
  try {
    if (!Need || mongoose_not_connected()) {
      const fake = { ...req.body, _id: Date.now().toString(), status: 'Open', createdAt: new Date() };
      return res.status(201).json(fake);
    }
    const need = new Need(req.body);
    await need.save();
    res.status(201).json(need);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update need
router.put('/:id', async (req, res) => {
  try {
    if (!Need || mongoose_not_connected()) return res.json({ ...req.body, _id: req.params.id });
    const need = await Need.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!need) return res.status(404).json({ error: 'Need not found' });
    res.json(need);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE need
router.delete('/:id', async (req, res) => {
  try {
    if (!Need || mongoose_not_connected()) return res.json({ message: 'Deleted (mock)' });
    await Need.findByIdAndDelete(req.params.id);
    res.json({ message: 'Need deleted' });
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
