import { useEffect, useState } from 'react';
import { getVolunteers, createVolunteer, updateVolunteer, deleteVolunteer } from '../api.js';

const ALL_SKILLS = [
  'cooking', 'logistics', 'driving',
  'nursing', 'first aid', 'medicine',
  'teaching', 'tutoring', 'training',
  'construction', 'carpentry', 'building',
  'social work', 'counseling', 'admin',
];

const DEFAULT_FORM = { name: '', area: '', phone: '', email: '', skills: [] };

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`toast${type === 'error' ? ' error' : ''}`}>{msg}</div>;
}

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'ok' });

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'ok' }), 3000);
  };

  useEffect(() => {
    getVolunteers().then(v => { setVolunteers(v); setLoading(false); });
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.area.trim()) return showToast('Name and Area are required', 'error');
    setSubmitting(true);
    try {
      const vol = await createVolunteer({ ...form, availability: true });
      setVolunteers(prev => [vol, ...prev]);
      setForm(DEFAULT_FORM);
      showToast('✅ Volunteer registered!');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAvailability = async (vol) => {
    const updated = await updateVolunteer(vol._id, { ...vol, availability: !vol.availability });
    setVolunteers(prev => prev.map(v => v._id === vol._id ? updated : v));
  };

  const handleDelete = async (id) => {
    await deleteVolunteer(id);
    setVolunteers(prev => prev.filter(v => v._id !== id));
    showToast('🗑️ Volunteer removed');
  };

  return (
    <div>
      <Toast {...toast} />
      <div className="page-header fade-in">
        <h1 className="page-title">🙋 Volunteer Registry</h1>
        <p className="page-subtitle">Register volunteers and manage their availability</p>
      </div>

      <div className="two-col">
        {/* ── Registration form ── */}
        <div className="form-section fade-in">
          <h2 className="section-title">📝 Register a Volunteer</h2>
          <form id="volunteer-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="vol-name">Full Name *</label>
                <input
                  id="vol-name" name="name" type="text"
                  placeholder="e.g. Rohan Mehta"
                  value={form.name} onChange={handleChange} required
                />
              </div>
              <div className="form-group">
                <label htmlFor="vol-area">Area / Location *</label>
                <input
                  id="vol-area" name="area" type="text"
                  placeholder="e.g. North Quarters"
                  value={form.area} onChange={handleChange} required
                />
              </div>
              <div className="form-group">
                <label htmlFor="vol-phone">Phone</label>
                <input
                  id="vol-phone" name="phone" type="tel"
                  placeholder="e.g. 9876543210"
                  value={form.phone} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="vol-email">Email</label>
                <input
                  id="vol-email" name="email" type="email"
                  placeholder="e.g. rohan@example.com"
                  value={form.email} onChange={handleChange}
                />
              </div>
              <div className="form-group full">
                <label>Skills (select all that apply)</label>
                <div className="skills-grid">
                  {ALL_SKILLS.map(skill => (
                    <label
                      key={skill}
                      className={`skill-chip${form.skills.includes(skill) ? ' selected' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={form.skills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setForm(DEFAULT_FORM)}>Clear</button>
              <button id="submit-volunteer" type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Registering…' : '🙋 Register Volunteer'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Volunteer list ── */}
        <div className="fade-in">
          <h2 className="section-title">
            👥 Registered Volunteers
            <span style={{ marginLeft: 'auto', background: 'rgba(0,245,160,0.1)', border: '1px solid rgba(0,245,160,0.2)', color: 'var(--green)', borderRadius: '50px', padding: '0.15rem 0.7rem', fontSize: '0.78rem' }}>
              {volunteers.filter(v => v.availability).length} available
            </span>
          </h2>

          {loading ? (
            <div className="loader"><div className="spinner" /> Loading…</div>
          ) : volunteers.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🙋</div><p>No volunteers yet. Be the first!</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '4px' }}>
              {volunteers.map(v => (
                <div key={v._id} className="card card-sm">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--green), var(--cyan))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '1.1rem', color: '#070d1a',
                    }}>
                      {v.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.1rem' }}>{v.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>📍 {v.area}</div>
                      {v.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 {v.phone}</div>}
                    </div>
                    {/* Availability toggle */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                      <label className="toggle-switch" title="Toggle availability">
                        <input
                          type="checkbox"
                          checked={v.availability}
                          onChange={() => toggleAvailability(v)}
                        />
                        <span className="toggle-slider" />
                      </label>
                      <span className={`badge ${v.availability ? 'badge-available' : 'badge-unavailable'}`} style={{ fontSize: '0.68rem' }}>
                        {v.availability ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  {v.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.6rem' }}>
                      {v.skills.map(s => (
                        <span key={s} style={{
                          fontSize: '0.72rem', background: 'rgba(0,212,255,0.1)',
                          border: '1px solid rgba(0,212,255,0.2)', color: 'var(--cyan)',
                          borderRadius: '50px', padding: '0.15rem 0.55rem',
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleDelete(v._id)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
