const mongoose = require('mongoose');

const NeedSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  area: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Medical', 'Education', 'Shelter', 'General'],
  },
  urgency: { type: Number, required: true, min: 1, max: 5 },
  volunteersNeeded: { type: Number, default: 1 },
  description: { type: String, trim: true },
  reportedBy: { type: String, trim: true, default: 'Anonymous' },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Need', NeedSchema);
