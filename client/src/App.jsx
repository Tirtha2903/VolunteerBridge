import { useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import NeedsPage from './pages/NeedsPage.jsx';
import VolunteersPage from './pages/VolunteersPage.jsx';
import MatchPage from './pages/MatchPage.jsx';

const TABS = [
  { id: 'dashboard',   label: 'Dashboard',   icon: '📊' },
  { id: 'needs',       label: 'Needs',        icon: '🆘' },
  { id: 'volunteers',  label: 'Volunteers',   icon: '🙋' },
  { id: 'match',       label: 'Smart Match',  icon: '⚡' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-shell">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="logo">
            <div className="logo-icon">🌿</div>
            <span className="logo-text">VolunteerBridge</span>
          </div>
          <div className="nav-tabs" role="tablist">
            {TABS.map(tab => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`nav-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="main-content" role="main">
        {activeTab === 'dashboard'  && <Dashboard  onNavigate={setActiveTab} />}
        {activeTab === 'needs'      && <NeedsPage />}
        {activeTab === 'volunteers' && <VolunteersPage />}
        {activeTab === 'match'      && <MatchPage />}
      </main>

      {/* ── Footer ── */}
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--border)' }}>
        VolunteerBridge · Smart Resource Allocation for Social Impact · Google Solutions Challenge 2026
      </footer>
    </div>
  );
}
