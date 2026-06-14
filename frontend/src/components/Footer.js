import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="app-footer mt-auto py-3 px-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 small text-muted">
        <span>© {new Date().getFullYear()} MindWatch AI · Mental Health Monitoring</span>
        <div className="d-flex gap-3">
          <Link to="/crisis" className="text-danger text-decoration-none">Crisis Help</Link>
          <Link to="/resources" className="text-decoration-none">Resources</Link>
          <Link to="/settings" className="text-decoration-none">Settings</Link>
        </div>
      </div>
    </footer>
  );
}
