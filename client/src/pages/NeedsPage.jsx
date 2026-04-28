import { useEffect, useState } from 'react';
import { getNeeds, createNeed, updateNeed, deleteNeed } from '../api.js';

const CATEGORIES = ['Food', 'Medical', 'Education', 'Shelter', 'General'];
const CAT_ICONS = { Food: '🍱', Medical: '🏥', Education: '📚', Shelter: '🏠', General: '📋' };
const URGENCY_LABELS = { 5: 'Critical', 4: 'High', 3: 'Medium', 2: 'Low', 1: 'Minimal' };

const DEFAULT_FORM = {
  title: '', area: '', category: 'Food', urgency: 3,
  volunteersNeeded: 1, description: '', reportedBy: '',
};

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`toast${type === 'error' ? ' error' : ''}`}>{msg}</div>;
}

export default function NeedsPage() {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'ok' });

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'ok' }), 3000);
  };

  useEffect(() => {
    getNeeds().then(n => { setNeeds(n); setLoading(false); });
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'urgency' || name === 'volunteersNeeded' ? Number(value) : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim() || !form.area.trim()) return showToast('Title and Area are required', 'error');
    setSubmitting(true);
    try {
      const newNeed = await createNeed(form);
      setNeeds(prev => [newNeed, ...prev]);
      setForm(DEFAULT_FORM);
      showToast('✅ Need reported successfully!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteNeed(id);
    setNeeds(prev => prev.filter(n => n._id !== id));
    showToast('🗑️ Need removed');
  };

  const handleStatusToggle = async (need) => {
    const next = need.status === 'Open' ? 'In Progress' : need.status === 'In Progress' ? 'Resolved' : 'Open';
    const updated = await updateNeed(need._id, { ...need, status: next });
    setNeeds(prev => prev.map(n => n._id === need._id ? updated : n));
  };

  return (
    <div>
      <Toast {...toast} />
      <div className="page-header fade-in">
        <h1 className="page-title">🆘 Community Needs</h1>
        <p className="page-subtitle">Submit and track urgent local needs from your community</p>
      </div>

      <div className="two-col">
        {/* ── Submit form ── */}
        <div className="form-section fade-in">
          <h2 className="section-title">📝 Report a New Need</h2>
          <form id="needs-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="need-title">Need Title *</label>
                <input
                  id="need-title" name="title" type="text"
                  placeholder="e.g. Food kits for flood-affected families"
                  value={form.title} onChange={handleChange} required
                />
              </div>
              <div className="form-group">
                <label htmlFor="need-area">Area / Location *</label>
                <input
                  id="need-area" name="area" type="text"
                  placeholder="e.g. Riverside District"
                  value={form.area} onChange={handleChange} required
                />
              </div>
              <div className="form-group">
                <label htmlFor="need-category">Category</label>
                <select id="need-category" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="need-urgency">Urgency Level: {URGENCY_LABELS[form.urgency]}</label>
                <div className="slider-wrap">
                  <input
                    id="need-urgency" name="urgency" type="range"
                    min="1" max="5" value={form.urgency} onChange={handleChange}
                    style={{ '--pct': `${(form.urgency - 1) * 25}%` }}
                  />
                  <span className="slider-value">{form.urgency}</span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="need-volunteers">Volunteers Needed</label>
                <input
                  id="need-volunteers" name="volunteersNeeded" type="number"
                  min="1" max="100" value={form.volunteersNeeded} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="need-reported-by">Reported By</label>
                <input
                  id="need-reported-by" name="reportedBy" type="text"
                  placeholder="Name or organization"
                  value={form.reportedBy} onChange={handleChange}
                />
              </div>
              <div className="form-group full">
                <label htmlFor="need-description">Description</label>
                <textarea
                  id="need-description" name="description" rows="3"
                  placeholder="Describe the situation and what's needed…"
                  value={form.description} onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setForm(DEFAULT_FORM)}>
                Clear
              </button>
              <button id="submit-need" type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : '🆘 Submit Need'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Needs list ── */}
        <div className="fade-in">
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>
            📋 All Needs
            <span style={{ marginLeft: 'auto', background: 'rgba(0,245,160,0.1)', border: '1px solid rgba(0,245,160,0.2)', color: 'var(--green)', borderRadius: '50px', padding: '0.15rem 0.7rem', fontSize: '0.78rem' }}>
              {needs.length} total
            </span>
          </h2>

          {loading ? (
            <div className="loader"><div className="spinner" /> Loading…</div>
          ) : needs.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">✅</div><p>No needs reported yet. Submit the first one!</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '4px' }}>
              {needs.map(n => (
                <div key={n._id} className="card card-sm" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{CAT_ICONS[n.category]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{n.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>📍 {n.area} · 👤 {n.reportedBy || 'Anonymous'}</div>
                    </div>
                    <span className={`badge badge-urgency-${n.urgency}`} style={{ flexShrink: 0 }}>
                      {URGENCY_LABELS[n.urgency]}
                    </span>
                  </div>
                  {n.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', lineHeight: 1.5 }}>{n.description}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`badge badge-${(n.category || '').toLowerCase()}`}>{n.category}</span>
                    <span className={`badge badge-${(n.status || '').toLowerCase().replace(' ', '-')}`}>{n.status}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>👥 {n.volunteersNeeded} needed</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => handleStatusToggle(n)}
                        title="Cycle status"
                      >
                        🔄
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => handleDelete(n._id)}
                        title="Remove need"
                      >
                        ✕
                      </button>
                    </div>
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
