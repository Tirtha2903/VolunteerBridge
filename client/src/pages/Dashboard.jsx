import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getNeeds, getVolunteers, MOCK_NEEDS, MOCK_VOLUNTEERS } from '../api.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const CATEGORY_ICONS = { Food: '🍱', Medical: '🏥', Education: '📚', Shelter: '🏠', General: '📋' };
const URGENCY_LABELS = { 5: 'Critical', 4: 'High', 3: 'Medium', 2: 'Low', 1: 'Minimal' };

function UrgencyPips({ urgency }) {
  return (
    <div className="urgency-bar">
      {[1, 2, 3, 4, 5].map(n => (
        <div
          key={n}
          className={`urgency-pip${n <= urgency ? ` filled-${urgency}` : ''}`}
        />
      ))}
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getNeeds(), getVolunteers()])
      .then(([n, v]) => { setNeeds(n); setVolunteers(v); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /> Loading dashboard…</div>;

  const totalNeeds   = needs.length;
  const critical     = needs.filter(n => n.urgency >= 4).length;
  const totalVols    = volunteers.length;
  const available    = volunteers.filter(v => v.availability).length;

  // Category breakdown
  const catCounts = {};
  needs.forEach(n => { catCounts[n.category] = (catCounts[n.category] || 0) + 1; });
  const cats = Object.keys(catCounts);

  const barData = {
    labels: cats,
    datasets: [{
      label: 'Community Needs',
      data: cats.map(c => catCounts[c]),
      backgroundColor: [
        'rgba(251,146,60,0.7)',
        'rgba(248,113,113,0.7)',
        'rgba(0,212,255,0.7)',
        'rgba(168,85,247,0.7)',
        'rgba(255,255,255,0.3)',
      ],
      borderColor: [
        'rgba(251,146,60,1)',
        'rgba(248,113,113,1)',
        'rgba(0,212,255,1)',
        'rgba(168,85,247,1)',
        'rgba(255,255,255,0.5)',
      ],
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} need(s)` } },
    },
    scales: {
      x: { ticks: { color: '#8b9ab5' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#8b9ab5', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.06)' } },
    },
  };

  const doughnutData = {
    labels: ['Available', 'Unavailable'],
    datasets: [{
      data: [available, totalVols - available],
      backgroundColor: ['rgba(0,245,160,0.7)', 'rgba(248,113,113,0.4)'],
      borderColor: ['rgba(0,245,160,1)', 'rgba(248,113,113,0.6)'],
      borderWidth: 2,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#8b9ab5', padding: 16, font: { size: 12 } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed} volunteer(s)` } },
    },
    cutout: '70%',
  };

  const topUrgent = [...needs].sort((a, b) => b.urgency - a.urgency).slice(0, 5);

  return (
    <div>
      {/* ── Hero heading ── */}
      <div className="page-header fade-in">
        <h1 className="page-title">Community Dashboard</h1>
        <p className="page-subtitle">Real-time snapshot of local needs and volunteer availability</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        {[
          { value: totalNeeds, label: 'Total Needs Reported', icon: '🆘', color: 'var(--cyan)',   accentVar: '--accent', accent: 'var(--cyan)' },
          { value: critical,   label: 'Critical / High Urgency', icon: '🚨', color: 'var(--red)',    accent: 'var(--red)' },
          { value: totalVols,  label: 'Volunteers Registered', icon: '🙋', color: 'var(--green)',  accent: 'var(--green)' },
          { value: available,  label: 'Available Now',          icon: '✅', color: 'var(--purple)', accent: 'var(--purple)' },
        ].map((s, i) => (
          <div key={i} className={`stat-card fade-in-delay-${i + 1}`} style={{ '--accent': s.accent }}>
            <div className="stat-icon" style={{ background: `${s.accent}18` }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts + urgent list ── */}
      <div className="dashboard-grid fade-in">
        {/* Bar chart */}
        <div className="card">
          <h2 className="section-title">📈 Needs by Category</h2>
          <div className="chart-wrap">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Volunteer doughnut */}
        <div className="card">
          <h2 className="section-title">🙋 Volunteer Status</h2>
          <div className="chart-wrap">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* ── Top urgent needs ── */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 className="section-title">🚨 Most Urgent Needs</h2>
        {topUrgent.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🎉</div><p>No urgent needs!</p></div>
        ) : (
          topUrgent.map(n => (
            <div key={n._id} className="urgent-item">
              <span className="u-icon">{CATEGORY_ICONS[n.category] || '📋'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="u-title">{n.title}</div>
                <div className="u-meta">{n.area} · {n.volunteersNeeded} volunteers needed</div>
              </div>
              <UrgencyPips urgency={n.urgency} />
              <span className={`badge badge-urgency-${n.urgency}`} style={{ marginLeft: '0.5rem' }}>
                {URGENCY_LABELS[n.urgency]}
              </span>
            </div>
          ))
        )}
      </div>

      {/* ── Quick action buttons ── */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button id="btn-report-need" className="btn btn-primary" onClick={() => onNavigate('needs')}>
          ＋ Report a Need
        </button>
        <button id="btn-register-vol" className="btn btn-ghost" onClick={() => onNavigate('volunteers')}>
          🙋 Register as Volunteer
        </button>
        <button id="btn-run-match" className="btn btn-ghost" onClick={() => onNavigate('match')}>
          ⚡ Run Smart Match
        </button>
      </div>
    </div>
  );
}
