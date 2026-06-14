import React, { useEffect, useState } from 'react';
import { getHistory, getRecommendations } from '../services/api';

const meta = {
  sleep: { icon: 'bi-moon-stars-fill', color: '#8b5cf6', title: 'Sleep Improvement' },
  stress: { icon: 'bi-wind', color: '#06b6d4', title: 'Stress Reduction' },
  activity: { icon: 'bi-heart-pulse-fill', color: '#10b981', title: 'Physical Activity' },
  wellness: { icon: 'bi-flower1', color: '#f59e0b', title: 'Mental Wellness' },
};

export default function Recommendations() {
  const [categories, setCategories] = useState(null);
  const [risk, setRisk] = useState('');

  useEffect(() => {
    getHistory().then((r) => {
      const latest = r.data.history?.[0];
      const level = latest?.prediction || 'Moderate Risk';
      setRisk(level);
      getRecommendations(level).then((res) => {
        if (res.data.categories) setCategories(res.data.categories);
      });
    });
  }, []);

  if (!categories) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Loading personalized recommendations...</p>
      </div>
    );
  }

  const riskClass = risk.includes('High') ? 'risk-high' : risk.includes('Moderate') ? 'risk-moderate' : 'risk-low';

  return (
    <div className="fade-in">
      <div className="page-header d-flex flex-wrap justify-content-between align-items-start gap-2">
        <div>
          <h1>Wellness Recommendations</h1>
          <p className="text-muted mb-0">Personalized guidance based on your AI risk assessment</p>
        </div>
        <span className={`risk-badge ${riskClass} fs-6`}>{risk}</span>
      </div>

      <div className="row g-4">
        {Object.entries(categories).map(([cat, items]) => {
          const m = meta[cat] || { icon: 'bi-lightbulb', color: '#6366f1', title: cat };
          return (
            <div className="col-md-6" key={cat}>
              <div className="card-mw p-4 h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="stat-icon" style={{ background: m.color, width: 44, height: 44, fontSize: '1.1rem' }}>
                    <i className={`bi ${m.icon}`} />
                  </div>
                  <h5 className="mb-0">{m.title}</h5>
                </div>
                <ul className="list-unstyled mb-0">
                  {items.map((t, i) => (
                    <li key={i} className="d-flex gap-2 py-2 border-bottom border-opacity-10">
                      <i className="bi bi-check2-circle text-success flex-shrink-0 mt-1" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
