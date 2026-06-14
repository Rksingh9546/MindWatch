import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';

const FEATURES = [
  { icon: 'bi-cpu', title: 'AI Risk Prediction', desc: 'Random Forest ML analyzes sleep, stress & activity for early depression detection.' },
  { icon: 'bi-graph-up-arrow', title: 'Smart Analytics', desc: 'Interactive charts, weekly reports, and assessment trend comparisons.' },
  { icon: 'bi-robot', title: 'AI Wellness Chat', desc: '24/7 conversational support with context from your health data.' },
  { icon: 'bi-emoji-smile', title: 'Mood & Journal', desc: 'Daily check-ins, private journal, sleep tracker & achievement badges.' },
];

export default function Landing() {
  return (
    <div className="landing-page" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)' }}>
      <AnimatedBackground />
      <nav className="d-flex justify-content-between align-items-center p-4 position-relative" style={{ zIndex: 2 }}>
        <div className="d-flex align-items-center gap-2 text-white">
          <div className="brand-logo"><i className="bi bi-heart-pulse-fill" /></div>
          <span className="fw-bold fs-5" style={{ fontFamily: 'var(--mw-font-display)' }}>MindWatch AI</span>
        </div>
        <div className="d-flex gap-2">
          <Link to="/login" className="btn btn-outline-light rounded-pill px-4">Sign In</Link>
          <Link to="/register" className="landing-glow-btn">Get Started</Link>
        </div>
      </nav>

      <section className="landing-hero text-white text-center">
        <span className="premium-badge d-inline-block mb-3">AI-Powered Mental Health Platform</span>
        <h1 className="landing-title mb-4">
          Early Depression Prediction<br />Through Behavioral AI
        </h1>
        <p className="lead mb-5 mx-auto opacity-75" style={{ maxWidth: 640 }}>
          Monitor sleep, stress, and activity. Get ML-powered risk assessments, personalized wellness plans, and an AI companion — all in one beautiful dashboard.
        </p>
        <div className="d-flex flex-wrap gap-3 justify-content-center mb-5">
          <Link to="/register" className="landing-glow-btn btn-lg">
            <i className="bi bi-rocket-takeoff" /> Start Free
          </Link>
          <Link to="/login" className="btn btn-outline-light btn-lg rounded-pill px-4">Demo Login</Link>
        </div>
        <div className="row g-4 mt-2 text-start" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {FEATURES.map((f) => (
            <div className="col-md-6 col-lg-3" key={f.title}>
              <div className="landing-feature-card">
                <i className={`bi ${f.icon} fs-2 text-info mb-3 d-block`} />
                <h6 className="text-white">{f.title}</h6>
                <p className="small mb-0 opacity-75">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
