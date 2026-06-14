import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const sections = [
  {
    title: 'Overview',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill' },
      { to: '/assessment', label: 'Assessment', icon: 'bi-clipboard2-pulse-fill' },
      { to: '/analytics', label: 'Analytics', icon: 'bi-graph-up-arrow' },
      { to: '/calendar', label: 'Mood Calendar', icon: 'bi-calendar-heart' },
    ],
  },
  {
    title: 'Wellness',
    links: [
      { to: '/mood', label: 'Mood Journal', icon: 'bi-emoji-smile' },
      { to: '/journal', label: 'Private Journal', icon: 'bi-journal-richtext' },
      { to: '/sleep', label: 'Sleep Tracker', icon: 'bi-moon-stars-fill' },
      { to: '/goals', label: 'Goals', icon: 'bi-bullseye' },
      { to: '/breathing', label: 'Breathing', icon: 'bi-wind' },
      { to: '/recommendations', label: 'Tips', icon: 'bi-lightbulb-fill' },
    ],
  },
  {
    title: 'AI & Learn',
    links: [
      { to: '/chat', label: 'AI Assistant', icon: 'bi-robot', special: true },
      { to: '/resources', label: 'Resource Library', icon: 'bi-collection-play' },
      { to: '/crisis', label: 'Crisis Help', icon: 'bi-life-preserver', alert: true },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/achievements', label: 'Achievements', icon: 'bi-trophy-fill' },
      { to: '/settings', label: 'Settings', icon: 'bi-gear-fill' },
      { to: '/profile', label: 'Profile', icon: 'bi-person-circle' },
    ],
  },
];

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <aside className="sidebar-advanced">
      <div className="sidebar-brand">
        <div className="brand-logo"><i className="bi bi-heart-pulse-fill" /></div>
        <div>
          <div className="fw-bold text-white" style={{ fontFamily: 'var(--mw-font-display)' }}>MindWatch</div>
          <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}>AI · v2.0 Premium</small>
        </div>
      </div>

      <nav className="sidebar-nav flex-grow-1">
        {sections.map((sec) => (
          <div key={sec.title} className="mb-2">
            <div className="text-white-50 text-uppercase px-2 mb-1" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>{sec.title}</div>
            {sec.links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} ${l.special ? 'chat-link' : ''} ${l.alert ? 'nav-alert' : ''}`}
                onClick={onNavigate}
              >
                <i className={`bi ${l.icon}`} />
                {l.label}
                {l.special && <span className="ms-auto badge rounded-pill" style={{ background: '#22d3ee', fontSize: '0.55rem' }}>AI</span>}
              </NavLink>
            ))}
          </div>
        ))}
        {user?.isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onNavigate}>
            <i className="bi bi-shield-lock-fill" /> Admin
          </NavLink>
        )}
      </nav>

      <div className="mt-auto pt-3 border-top border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-2 mb-3 px-1">
          <div className="brand-logo" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>{user?.name?.[0]?.toUpperCase()}</div>
          <div className="overflow-hidden">
            <div className="text-white small fw-semibold text-truncate">{user?.name}</div>
            <div className="text-white-50 text-truncate" style={{ fontSize: '0.65rem' }}>{user?.email}</div>
          </div>
        </div>
        <button type="button" className="btn btn-sm btn-outline-light w-100 mb-2" onClick={toggle}>
          <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`} /> {theme === 'light' ? 'Dark' : 'Light'}
        </button>
        <button type="button" className="btn btn-sm w-100" style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }} onClick={logout}>
          <i className="bi bi-box-arrow-right" /> Logout
        </button>
      </div>
    </aside>
  );
}
