import { useState } from 'react';
import { runMatch } from '../api.js';

const URGENCY_LABELS = { 5: 'Critical', 4: 'High', 3: 'Medium', 2: 'Low', 1: 'Minimal' };
const CAT_ICONS = { Food: '🍱', Medical: '🏥', Education: '📚', Shelter: '🏠', General: '📋' };

export default function MatchPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    setLoading(true);
    try {
      const data = await runMatch();
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header fade-in">
        <h1 className="page-title">⚡ Smart Match Engine</h1>
        <p className="page-subtitle">
          AI-powered algorithm matches available volunteers to the most urgent community needs
        </p>
      </div>

      {/* ── How it works ── */}
      <div className="card fade-in" style={{ marginBottom: '1.5rem' }}>
        <h2 className="section-title">🧠 How the Algorithm Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🚨', label: 'Urgency Score', desc: '+2 × urgency level (1–5)', color: 'var(--red)' },
            { icon: '🎯', label: 'Skill Match', desc: '+3 if volunteer skill fits category', color: 'var(--cyan)' },
            { icon: '📍', label: 'Area Match', desc: '+2 if same location', color: 'var(--purple)' },
            { icon: '🏆', label: 'Best Pair', desc: 'Highest-scoring volunteer → need', color: 'var(--green)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '1rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: s.color, marginBottom: '0.25rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Run button ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <button
          id="run-match-btn"
          className="btn btn-primary"
          style={{ padding: '0.9rem 2.5rem', fontSize: '1rem', gap: '0.6rem' }}
          onClick={handleMatch}
          disabled={loading}
        >
          {loading ? (
            <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2.5 }} /> Matching…</>
          ) : (
            <>⚡ Run Smart Match</>
          )}
        </button>
      </div>

      {/* ── Results ── */}
      {result && (
        <div className="fade-in">
          {/* Summary bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Needs Analysed', value: result.totalNeeds, color: 'var(--cyan)' },
              { label: 'Volunteers Available', value: result.totalVolunteers, color: 'var(--green)' },
              { label: 'Matches Found', value: result.matches?.length || 0, color: 'var(--purple)' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, minWidth: 140,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '1rem 1.25rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Match cards */}
          {result.matches?.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🤔</div>
              <p>No matches found. Add more volunteers or needs!</p>
            </div>
          ) : (
            <>
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>
                🏆 Recommended Assignments
                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  sorted by match score
                </span>
              </h2>
              <div className="match-grid">
                {result.matches.map((m, idx) => (
                  <div key={idx} className="match-card">
                    {/* Rank */}
                    <span style={{
                      position: 'absolute', top: '0.9rem', left: '1rem',
                      fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700,
                    }}>
                      #{idx + 1}
                    </span>
                    <span className="match-score">⭐ {m.score}</span>

                    {/* Volunteer */}
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                        VOLUNTEER
                      </div>
                      <div className="match-volunteer">🙋 {m.volunteer.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        📍 {m.volunteer.area}
                      </div>
                      {m.volunteer.skills?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>
                          {m.volunteer.skills.map(s => (
                            <span key={s} style={{
                              fontSize: '0.7rem', padding: '0.1rem 0.5rem',
                              borderRadius: '50px', background: 'rgba(0,212,255,0.1)',
                              border: '1px solid rgba(0,212,255,0.2)', color: 'var(--cyan)',
                            }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="match-arrow">→</div>

                    {/* Need */}
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                        ASSIGNED TO
                      </div>
                      <div className="match-need">
                        {CAT_ICONS[m.need.category]} {m.need.title}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <span className={`badge badge-urgency-${m.need.urgency}`}>
                          {URGENCY_LABELS[m.need.urgency]} ({m.need.urgency}/5)
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📍 {m.need.area}</span>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="match-reason">💡 {m.reason}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Empty pre-run state ── */}
      {!result && !loading && (
        <div className="empty-state fade-in">
          <div className="empty-icon">⚡</div>
          <p>Click <strong>Run Smart Match</strong> to see recommended volunteer assignments</p>
        </div>
      )}
    </div>
  );
}
