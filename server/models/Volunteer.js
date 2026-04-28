const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  skills: [{ type: String, trim: true }],
  area: { type: String, required: true, trim: true },
  availability: { type: Boolean, default: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true },
  assignedTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Need', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);
