import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import AIChatbot from './AIChatbot';
import NotificationBell from './NotificationBell';
import AnimatedBackground from './AnimatedBackground';
import Footer from './Footer';
import Onboarding from './Onboarding';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/assessment': 'Mental Health Assessment',
  '/analytics': 'Analytics',
  '/calendar': 'Mood Calendar',
  '/mood': 'Mood Journal',
  '/journal': 'Private Journal',
  '/sleep': 'Sleep Tracker',
  '/goals': 'Wellness Goals',
  '/breathing': 'Breathing Exercise',
  '/recommendations': 'Recommendations',
  '/chat': 'AI Wellness Assistant',
  '/resources': 'Wellness Library',
  '/crisis': 'Crisis Resources',
  '/achievements': 'Achievements',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/admin': 'Admin Panel',
};

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'MindWatch AI';
  const showFab = location.pathname !== '/chat';

  return (
    <div className="d-flex min-vh-100 position-relative">
      <AnimatedBackground />
      <Onboarding />

      <div className="d-none d-lg-block" style={{ width: 260, flexShrink: 0 }}>
        <Sidebar />
      </div>

      {mobileOpen && (
        <>
          <div className="sidebar-overlay d-lg-none" onClick={() => setMobileOpen(false)} />
          <div className="sidebar-mobile d-lg-none"><Sidebar onNavigate={() => setMobileOpen(false)} /></div>
        </>
      )}

      <div className="flex-grow-1 d-flex flex-column min-vh-100">
        <header className="topbar">
          <div className="d-flex align-items-center gap-3">
            <button type="button" className="btn btn-link p-0 d-lg-none" style={{ color: 'var(--mw-text)' }} onClick={() => setMobileOpen(true)}>
              <i className="bi bi-list fs-4" />
            </button>
            <div>
              <h6 className="mb-0 fw-bold" style={{ fontFamily: 'var(--mw-font-display)' }}>{title}</h6>
              <small className="text-muted">Hi, {user?.name?.split(' ')[0]} · MindWatch Premium</small>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <NotificationBell />
            <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill d-none d-md-inline-flex" onClick={toggle}>
              <i className={`bi ${theme === 'light' ? 'bi-moon-fill' : 'bi-sun-fill'}`} />
            </button>
            <span className="badge rounded-pill d-none d-sm-inline-flex" style={{ background: 'linear-gradient(135deg,#6366f1,#22d3ee)', padding: '0.45rem 0.85rem' }}>
              <i className="bi bi-stars me-1" /> AI Active
            </span>
          </div>
        </header>
        <main className="flex-grow-1 p-3 p-md-4 fade-in">{children}</main>
        <Footer />
      </div>

      {showFab && <AIChatbot />}
    </div>
  );
}
