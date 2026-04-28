const express = require('express');
const router = express.Router();

// Category → relevant skills mapping
const CATEGORY_SKILLS = {
  Food: ['cooking', 'logistics', 'driving', 'food'],
  Medical: ['nursing', 'first aid', 'medicine', 'medical', 'doctor'],
  Education: ['teaching', 'tutoring', 'training', 'education'],
  Shelter: ['construction', 'carpentry', 'logistics', 'building'],
  General: [],
};

/**
 * Score a (volunteer, need) pair:
 *   urgency × 2  — higher urgency = higher priority
 *   +3 if volunteer has a skill matching the need's category
 *   +2 if volunteer's area matches the need's area
 */
function scoreMatch(volunteer, need) {
  let score = need.urgency * 2;
  const relevantSkills = CATEGORY_SKILLS[need.category] || [];
  const volunteerSkills = (volunteer.skills || []).map(s => s.toLowerCase());
  const hasSkill = relevantSkills.some(rs => volunteerSkills.includes(rs));
  if (hasSkill) score += 3;
  if (volunteer.area && need.area &&
      volunteer.area.toLowerCase() === need.area.toLowerCase()) score += 2;
  return score;
}

function buildReason(volunteer, need) {
  const relevantSkills = CATEGORY_SKILLS[need.category] || [];
  const volunteerSkills = (volunteer.skills || []).map(s => s.toLowerCase());
  const hasSkill = relevantSkills.some(rs => volunteerSkills.includes(rs));
  const sameArea = volunteer.area && need.area &&
    volunteer.area.toLowerCase() === need.area.toLowerCase();
  const reasons = [];
  if (hasSkill) reasons.push(`Skills match (${need.category})`);
  if (sameArea) reasons.push('Same area');
  if (need.urgency >= 4) reasons.push(`High urgency (${need.urgency}/5)`);
  return reasons.length ? reasons.join(' · ') : 'General availability';
}

// Mock data for fallback
const mockNeeds = [
  { _id: '1', title: 'Emergency food kits', area: 'Riverside District', category: 'Food', urgency: 5, volunteersNeeded: 8, status: 'Open' },
  { _id: '2', title: 'Medical aid — medication shortage', area: 'North Quarters', category: 'Medical', urgency: 5, volunteersNeeded: 4, status: 'Open' },
  { _id: '3', title: 'After-school tutoring', area: 'Central Shelter Zone', category: 'Education', urgency: 3, volunteersNeeded: 6, status: 'Open' },
  { _id: '4', title: 'Temporary shelter repair', area: 'West Colony', category: 'Shelter', urgency: 4, volunteersNeeded: 10, status: 'Open' },
  { _id: '5', title: 'Clean water distribution', area: 'South End', category: 'Food', urgency: 4, volunteersNeeded: 5, status: 'Open' },
];
const mockVolunteers = [
  { _id: '1', name: 'Aisha Sharma', skills: ['cooking', 'logistics'], area: 'Riverside District', availability: true },
  { _id: '2', name: 'Rohan Mehta', skills: ['first aid', 'nursing'], area: 'North Quarters', availability: true },
  { _id: '3', name: 'Priya Verma', skills: ['teaching', 'tutoring'], area: 'Central Shelter Zone', availability: true },
  { _id: '4', name: 'Amit Kumar', skills: ['construction', 'carpentry'], area: 'West Colony', availability: true },
];

// POST /api/match — run smart matching
router.post('/', async (req, res) => {
  try {
    let needs, volunteers;
    if (mongoose_not_connected()) {
      needs = mockNeeds.filter(n => n.status === 'Open');
      volunteers = mockVolunteers.filter(v => v.availability);
    } else {
      const Need = require('../models/Need');
      const Volunteer = require('../models/Volunteer');
      needs = await Need.find({ status: { $in: ['Open', 'In Progress'] } }).sort({ urgency: -1 });
      volunteers = await Volunteer.find({ availability: true });
    }

    // Generate all scored pairs
    const pairs = [];
    for (const need of needs) {
      for (const vol of volunteers) {
        pairs.push({
          volunteer: { _id: vol._id, name: vol.name, skills: vol.skills, area: vol.area },
          need: { _id: need._id, title: need.title, area: need.area, category: need.category, urgency: need.urgency },
          score: scoreMatch(vol, need),
          reason: buildReason(vol, need),
        });
      }
    }

    // Sort by score desc, deduplicate (each volunteer appears once — best match)
    pairs.sort((a, b) => b.score - a.score);
    const seen = new Set();
    const topMatches = [];
    for (const pair of pairs) {
      const key = `${pair.volunteer._id}-${pair.need._id}`;
      if (!seen.has(pair.volunteer._id) && !seen.has(key)) {
        seen.add(pair.volunteer._id);
        topMatches.push(pair);
      }
      if (topMatches.length >= 20) break;
    }

    res.json({ matches: topMatches, totalNeeds: needs.length, totalVolunteers: volunteers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function mongoose_not_connected() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState !== 1;
  } catch { return true; }
}

module.exports = router;
