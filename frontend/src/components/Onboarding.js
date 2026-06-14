import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  { icon: 'bi-clipboard2-pulse', title: 'AI Assessment', text: 'Get depression risk predictions from sleep, stress & activity data.' },
  { icon: 'bi-emoji-smile', title: 'Track Mood', text: 'Log daily mood and energy to spot patterns early.' },
  { icon: 'bi-robot', title: 'AI Assistant', text: 'Chat with MindWatch AI for personalized wellness guidance.' },
  { icon: 'bi-trophy', title: 'Earn Achievements', text: 'Stay motivated with goals, streaks, and badges.' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const dismissed = localStorage.getItem('onboarding_done');

  if (dismissed) return null;

  const finish = () => {
    localStorage.setItem('onboarding_done', '1');
    window.location.reload();
  };

  const s = STEPS[step];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card card-mw p-4 p-md-5 text-center">
        <div className="onboarding-icon mx-auto mb-3">
          <i className={`bi ${s.icon}`} />
        </div>
        <h4 className="mb-2">{s.title}</h4>
        <p className="text-muted mb-4">{s.text}</p>
        <div className="d-flex justify-content-center gap-1 mb-4">
          {STEPS.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>
        <div className="d-flex gap-2 justify-content-center">
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(step - 1)}>Back</button>}
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-mw-primary" onClick={() => setStep(step + 1)}>Next</button>
          ) : (
            <Link to="/assessment" className="btn btn-mw-primary" onClick={finish}>Start Assessment</Link>
          )}
          <button type="button" className="btn btn-link text-muted" onClick={finish}>Skip</button>
        </div>
      </div>
    </div>
  );
}
