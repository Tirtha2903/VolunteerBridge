const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const needsRoutes = require('./routes/needs');
const volunteersRoutes = require('./routes/volunteers');
const matchRoutes = require('./routes/match');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/needs', needsRoutes);
app.use('/api/volunteers', volunteersRoutes);
app.use('/api/match', matchRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🌿 VolunteerBridge API is running!' });
});

// ── MongoDB Connection ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn('⚠️  MONGO_URI not set — running without database (mock mode)');
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT} (no DB)`);
  });
} else {
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB');
      await seedIfEmpty();
      app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

// ── Seed initial data ────────────────────────────────────────
async function seedIfEmpty() {
  const Need = require('./models/Need');
  const Volunteer = require('./models/Volunteer');

  const needCount = await Need.countDocuments();
  if (needCount === 0) {
    await Need.insertMany([
      { title: 'Emergency food kits for flood-affected families', area: 'Riverside District', category: 'Food', urgency: 5, volunteersNeeded: 8, description: 'Severe flooding has displaced 200+ families with no food access.', reportedBy: 'Field Team Alpha' },
      { title: 'Medical aid camp — diabetic medication shortage', area: 'North Quarters', category: 'Medical', urgency: 5, volunteersNeeded: 4, description: 'Critical shortage of insulin and BP medications in community clinic.', reportedBy: 'Dr. Priya Nair' },
      { title: 'After-school tutoring for displaced children', area: 'Central Shelter Zone', category: 'Education', urgency: 3, volunteersNeeded: 6, description: 'Children in relief camps need educational support to continue learning.', reportedBy: 'NGO EduReach' },
      { title: 'Temporary shelter repair after storm damage', area: 'West Colony', category: 'Shelter', urgency: 4, volunteersNeeded: 10, description: 'Storm damaged 30 tin-roof homes; families sleeping in open.', reportedBy: 'Community Leader Raju' },
      { title: 'Clean water distribution — contamination alert', area: 'South End', category: 'Food', urgency: 4, volunteersNeeded: 5, description: 'Well contamination confirmed; need volunteers to distribute water packets.', reportedBy: 'Health Inspector Office' },
    ]);
    console.log('🌱 Seeded sample needs');
  }

  const volCount = await Volunteer.countDocuments();
  if (volCount === 0) {
    await Volunteer.insertMany([
      { name: 'Aisha Sharma', skills: ['cooking', 'logistics'], area: 'Riverside District', availability: true, phone: '9876543210', email: 'aisha@example.com' },
      { name: 'Rohan Mehta', skills: ['first aid', 'nursing'], area: 'North Quarters', availability: true, phone: '9876543211', email: 'rohan@example.com' },
      { name: 'Priya Verma', skills: ['teaching', 'tutoring'], area: 'Central Shelter Zone', availability: true, phone: '9876543212', email: 'priya@example.com' },
      { name: 'Amit Kumar', skills: ['construction', 'carpentry'], area: 'West Colony', availability: true, phone: '9876543213', email: 'amit@example.com' },
      { name: 'Sunita Rao', skills: ['driving', 'logistics'], area: 'South End', availability: false, phone: '9876543214', email: 'sunita@example.com' },
    ]);
    console.log('🌱 Seeded sample volunteers');
  }
}
