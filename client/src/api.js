import axios from 'axios';

// ── Base URL ──────────────────────────────────────────────
// In production set VITE_API_URL to your Render backend URL.
// During local dev, Vite proxy routes /api → localhost:5000.
const BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: BASE, timeout: 8000 });

// ── Mock data (shown when backend is unreachable) ─────────
export const MOCK_NEEDS = [
  { _id: '1', title: 'Emergency food kits for flood-affected families', area: 'Riverside District', category: 'Food', urgency: 5, volunteersNeeded: 8, description: 'Severe flooding has displaced 200+ families with no food access.', reportedBy: 'Field Team Alpha', status: 'Open', createdAt: new Date().toISOString() },
  { _id: '2', title: 'Medical aid camp — diabetic medication shortage', area: 'North Quarters', category: 'Medical', urgency: 5, volunteersNeeded: 4, description: 'Critical shortage of insulin and BP medications in community clinic.', reportedBy: 'Dr. Priya Nair', status: 'Open', createdAt: new Date().toISOString() },
  { _id: '3', title: 'After-school tutoring for displaced children', area: 'Central Shelter Zone', category: 'Education', urgency: 3, volunteersNeeded: 6, description: 'Children in relief camps need educational support.', reportedBy: 'NGO EduReach', status: 'Open', createdAt: new Date().toISOString() },
  { _id: '4', title: 'Temporary shelter repair after storm damage', area: 'West Colony', category: 'Shelter', urgency: 4, volunteersNeeded: 10, description: 'Storm damaged 30 tin-roof homes; families sleeping in open.', reportedBy: 'Community Leader Raju', status: 'In Progress', createdAt: new Date().toISOString() },
  { _id: '5', title: 'Clean water distribution — contamination alert', area: 'South End', category: 'Food', urgency: 4, volunteersNeeded: 5, description: 'Well contamination confirmed; distribute water packets.', reportedBy: 'Health Inspector Office', status: 'Open', createdAt: new Date().toISOString() },
];

export const MOCK_VOLUNTEERS = [
  { _id: '1', name: 'Aisha Sharma', skills: ['cooking', 'logistics'], area: 'Riverside District', availability: true, phone: '9876543210', email: 'aisha@example.com', createdAt: new Date().toISOString() },
  { _id: '2', name: 'Rohan Mehta', skills: ['first aid', 'nursing'], area: 'North Quarters', availability: true, phone: '9876543211', email: 'rohan@example.com', createdAt: new Date().toISOString() },
  { _id: '3', name: 'Priya Verma', skills: ['teaching', 'tutoring'], area: 'Central Shelter Zone', availability: true, phone: '9876543212', email: 'priya@example.com', createdAt: new Date().toISOString() },
  { _id: '4', name: 'Amit Kumar', skills: ['construction', 'carpentry'], area: 'West Colony', availability: true, phone: '9876543213', email: 'amit@example.com', createdAt: new Date().toISOString() },
  { _id: '5', name: 'Sunita Rao', skills: ['driving', 'logistics'], area: 'South End', availability: false, phone: '9876543214', email: 'sunita@example.com', createdAt: new Date().toISOString() },
];

export const MOCK_MATCHES = {
  totalNeeds: 5,
  totalVolunteers: 4,
  matches: [
    { volunteer: { _id: '1', name: 'Aisha Sharma', skills: ['cooking', 'logistics'], area: 'Riverside District' }, need: { _id: '1', title: 'Emergency food kits', area: 'Riverside District', category: 'Food', urgency: 5 }, score: 15, reason: 'Skills match (Food) · Same area · High urgency (5/5)' },
    { volunteer: { _id: '2', name: 'Rohan Mehta', skills: ['first aid', 'nursing'], area: 'North Quarters' }, need: { _id: '2', title: 'Medical aid camp', area: 'North Quarters', category: 'Medical', urgency: 5 }, score: 15, reason: 'Skills match (Medical) · Same area · High urgency (5/5)' },
    { volunteer: { _id: '4', name: 'Amit Kumar', skills: ['construction', 'carpentry'], area: 'West Colony' }, need: { _id: '4', title: 'Temporary shelter repair', area: 'West Colony', category: 'Shelter', urgency: 4 }, score: 13, reason: 'Skills match (Shelter) · Same area · High urgency (4/5)' },
    { volunteer: { _id: '3', name: 'Priya Verma', skills: ['teaching', 'tutoring'], area: 'Central Shelter Zone' }, need: { _id: '3', title: 'After-school tutoring', area: 'Central Shelter Zone', category: 'Education', urgency: 3 }, score: 11, reason: 'Skills match (Education) · Same area' },
  ],
};

// ── API functions ─────────────────────────────────────────
export async function getNeeds() {
  try {
    const { data } = await api.get('/api/needs');
    return data;
  } catch {
    return MOCK_NEEDS;
  }
}

export async function createNeed(payload) {
  try {
    const { data } = await api.post('/api/needs', payload);
    return data;
  } catch {
    return { ...payload, _id: Date.now().toString(), status: 'Open', createdAt: new Date().toISOString() };
  }
}

export async function updateNeed(id, payload) {
  try {
    const { data } = await api.put(`/api/needs/${id}`, payload);
    return data;
  } catch {
    return { ...payload, _id: id };
  }
}

export async function deleteNeed(id) {
  try {
    await api.delete(`/api/needs/${id}`);
  } catch { /* no-op in mock mode */ }
}

export async function getVolunteers() {
  try {
    const { data } = await api.get('/api/volunteers');
    return data;
  } catch {
    return MOCK_VOLUNTEERS;
  }
}

export async function createVolunteer(payload) {
  try {
    const { data } = await api.post('/api/volunteers', payload);
    return data;
  } catch {
    return { ...payload, _id: Date.now().toString(), availability: true, createdAt: new Date().toISOString() };
  }
}

export async function updateVolunteer(id, payload) {
  try {
    const { data } = await api.put(`/api/volunteers/${id}`, payload);
    return data;
  } catch {
    return { ...payload, _id: id };
  }
}

export async function deleteVolunteer(id) {
  try {
    await api.delete(`/api/volunteers/${id}`);
  } catch { /* no-op */ }
}

export async function runMatch() {
  try {
    const { data } = await api.post('/api/match');
    return data;
  } catch {
    return MOCK_MATCHES;
  }
}
