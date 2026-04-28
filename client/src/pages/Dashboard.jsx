import { useEffect, useState, useRef } from 'react';
import { getNeeds, getVolunteers } from '../api.js';

// ── Chart.js: imported lazily at render time to avoid module-level
// canvas registration errors in production Vite bundles.
let ChartJS, Bar, Doughnut;
let chartsReady = false;

async function loadCharts() {
  if (chartsReady) return true;
  try {
    const cjs = await import('chart.js');
    const r2 = await import('react-chartjs-2');
    ChartJS = cjs.Chart;
    Bar = r2.Bar;
    Doughnut = r2.Doughnut;
    ChartJS.register(
      cjs.CategoryScale, cjs.LinearScale, cjs.BarElement,
      cjs.Title, cjs.Tooltip, cjs.Legend, cjs.ArcElement,
    );
    chartsReady = true;
    return true;
  } catch (e) {
    console.warn('Chart.js failed to load:', e);
    return false;
  }
}

const CATEGORY_ICONS = { Food: '🍱', Medical: '🏥', Education: '📚', Shelter: '🏠', General: '📋' };
const URGENCY_LABELS = { 5: 'Critical', 4: 'High', 3: 'Medium', 2: 'Low', 1: 'Minimal' };

const STAT_CONFIGS = [
  { label: 'Total Needs Reported',    icon: '🆘', bgColor: 'rgba(0,212,255,0.12)',    textColor: '#00d4ff' },
  { label: 'Critical / High Urgency', icon: '🚨', bgColor: 'rgba(248,113,113,0.12)', textColor: '#f87171' },
  { label: 'Volunteers Registered',   icon: '🙋', bgColor: 'rgba(0,245,160,0.12)',    textColor: '#00f5a0' },
  { label: 'Available Now',           icon: '✅', bgColor: 'rgba(168,85,247,0.12)',   textColor: '#a855f7' },
];

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

function SafeBarChart({ data, options }) {
  if (!Bar) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 80 }}>Chart unavailable</div>;
  try {
    return <Bar data={data} options={options} />;
  } catch {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 80 }}>Chart unavailable</div>;
  }
}

function SafeDoughnutChart({ data, options }) {
  if (!Doughnut) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 80 }}>Chart unavailable</div>;
  try {
    return <Doughnut data={data} options={options} />;
  } catch {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 80 }}>Chart unavailable</div>;
  }
}

export default function Dashboard({ onNavigate }) {
  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartsLoaded, setChartsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getNeeds(),
      getVolunteers(),
      loadCharts(),
    ]).then(([n, v, ok]) => {
      if (cancelled) return;
      setNeeds(Array.isArray(n) ? n : []);
      setVolunteers(Array.isArray(v) ? v : []);
      setChartsLoaded(ok);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /> Loading dashboard…</div>;

  const totalNeeds  = needs.length;
  const critical    = needs.filter(n => n && n.urgency >= 4).length;
  const totalVols   = volunteers.length;
  const available   = volunteers.filter(v => v && v.availability).length;
  const topUrgent   = [...needs].sort((a, b) => (b.urgency || 0) - (a.urgency || 0)).slice(0, 5);

  const statValues = [totalNeeds, critical, totalVols, available];

  // Category breakdown for chart
  const catCounts = {};
  needs.forEach(n => {
    if (n && n.category) catCounts[n.category] = (catCounts[n.category] || 0) + 1;
  });
  const cats = Object.keys(catCounts);

  const barData = {
    labels: cats,
    datasets: [{
      label: 'Community Needs',
      data: cats.map(c => catCounts[c]),
      backgroundColor: [
        'rgba(251,146,60,0.7)', 'rgba(248,113,113,0.7)',
        'rgba(0,212,255,0.7)',  'rgba(168,85,247,0.7)',
        'rgba(255,255,255,0.3)',
      ],
      borderColor: [
        'rgba(251,146,60,1)', 'rgba(248,113,113,1)',
        'rgba(0,212,255,1)',  'rgba(168,85,247,1)',
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
      data: [available, Math.max(0, totalVols - available)],
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

  return (
    <div>
      {/* ── Hero heading ── */}
      <div className="page-header fade-in">
        <h1 className="page-title">Community Dashboard</h1>
        <p className="page-subtitle">Real-time snapshot of local needs and volunteer availability</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        {STAT_CONFIGS.map((s, i) => (
          <div
            key={i}
            className={`stat-card fade-in-delay-${i + 1}`}
            style={{ borderTop: `2px solid ${s.textColor}` }}
          >
            <div className="stat-icon" style={{ background: s.bgColor }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: s.textColor, WebkitTextFillColor: s.textColor }}>
                {statValues[i]}
              </div>
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
            {chartsLoaded && cats.length > 0
              ? <SafeBarChart data={barData} options={barOptions} />
              : <div style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: 80, fontSize: '0.9rem' }}>
                  {cats.length === 0 ? 'No data yet' : 'Loading chart…'}
                </div>
            }
          </div>
        </div>

        {/* Volunteer doughnut */}
        <div className="card">
          <h2 className="section-title">🙋 Volunteer Status</h2>
          <div className="chart-wrap">
            {chartsLoaded && totalVols > 0
              ? <SafeDoughnutChart data={doughnutData} options={doughnutOptions} />
              : <div style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: 80, fontSize: '0.9rem' }}>
                  {totalVols === 0 ? 'No volunteers yet' : 'Loading chart…'}
                </div>
            }
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
                <div className="u-meta">{n.area} · {n.volunteersNeeded || 1} volunteers needed</div>
              </div>
              <UrgencyPips urgency={n.urgency || 1} />
              <span className={`badge badge-urgency-${n.urgency || 1}`} style={{ marginLeft: '0.5rem' }}>
                {URGENCY_LABELS[n.urgency] || 'Low'}
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
