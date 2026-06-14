import React, { useEffect, useState } from 'react';
import { getAchievements } from '../services/api';

export default function Achievements() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getAchievements().then((r) => setItems(r.data.achievements || []));
  }, []);

  const unlocked = items.filter((a) => a.unlocked).length;

  return (
    <div className="fade-in">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h1>Achievements</h1>
          <p className="text-muted mb-0">Earn badges by staying consistent with your wellness journey</p>
        </div>
        <span className="badge rounded-pill fs-6" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          {unlocked}/{items.length} Unlocked
        </span>
      </div>

      <div className="row g-3">
        {items.map((a) => (
          <div className="col-sm-6 col-lg-4" key={a.id}>
            <div className={`card-mw p-4 text-center h-100 ${a.unlocked ? '' : 'opacity-50'}`} style={a.unlocked ? { borderColor: 'rgba(16,185,129,0.4)' } : {}}>
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: 64,
                  height: 64,
                  background: a.unlocked ? 'linear-gradient(135deg,#10b981,#34d399)' : 'rgba(148,163,184,0.2)',
                  color: a.unlocked ? '#fff' : 'var(--mw-muted)',
                }}
              >
                <i className={`bi ${a.icon} fs-3`} />
              </div>
              <h6>{a.name}</h6>
              <p className="text-muted small mb-2">{a.desc}</p>
              {a.unlocked ? (
                <span className="badge bg-success"><i className="bi bi-check-lg me-1" />Unlocked</span>
              ) : (
                <span className="badge bg-secondary">Locked</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
