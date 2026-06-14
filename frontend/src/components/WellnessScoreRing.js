import React from 'react';

export default function WellnessScoreRing({ score = 0, grade = '', color = '#6366f1', size = 140 }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="wellness-ring text-center" style={{ width: size }}>
      <svg width={size} height={size} className="mx-auto">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="wellness-ring-label" style={{ marginTop: -size * 0.72 }}>
        <div className="display-5 fw-bold" style={{ color }}>{score}</div>
        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>{grade}</small>
      </div>
    </div>
  );
}
