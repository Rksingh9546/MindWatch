import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import WellnessScoreRing from '../components/WellnessScoreRing';
import { useAuth } from '../context/AuthContext';
import { getAchievements, getHistory, getInsights, getStreaks, getWeeklyReport, getWellnessScore } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const riskBadge = (p) => {
  if (!p) return <span className="text-muted">No data</span>;
  const cls = p.includes('High') ? 'risk-high' : p.includes('Moderate') ? 'risk-moderate' : 'risk-low';
  const icon = p.includes('High') ? 'bi-exclamation-triangle' : p.includes('Moderate') ? 'bi-dash-circle' : 'bi-check-circle';
  return <span className={`risk-badge ${cls}`}><i className={`bi ${icon}`} /> {p}</span>;
};

const QUICK = [
  { to: '/mood', icon: 'bi-emoji-smile', label: 'Mood', color: '#8b5cf6' },
  { to: '/journal', icon: 'bi-journal-text', label: 'Journal', color: '#6366f1' },
  { to: '/sleep', icon: 'bi-moon-stars', label: 'Sleep', color: '#06b6d4' },
  { to: '/assessment', icon: 'bi-clipboard2-pulse', label: 'Assess', color: '#10b981' },
  { to: '/breathing', icon: 'bi-wind', label: 'Breathe', color: '#22d3ee' },
  { to: '/chat', icon: 'bi-robot', label: 'AI Chat', color: '#f59e0b' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [report, setReport] = useState(null);
  const [insights, setInsights] = useState(null);
  const [wellness, setWellness] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [badges, setBadges] = useState(0);

  useEffect(() => {
    getHistory().then((r) => setHistory(r.data.history || [])).catch(() => {});
    getWeeklyReport().then((r) => setReport(r.data)).catch(() => {});
    getInsights().then((r) => setInsights(r.data)).catch(() => {});
    getWellnessScore().then((r) => setWellness(r.data)).catch(() => {});
    getStreaks().then((r) => setStreaks(r.data)).catch(() => {});
    getAchievements().then((r) => {
      const a = r.data.achievements || [];
      setBadges(a.filter((x) => x.unlocked).length);
    }).catch(() => {});
  }, []);

  const latest = history[0];
  const chartData = {
    labels: history.slice(0, 8).reverse().map((h) => new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Confidence',
      data: history.slice(0, 8).reverse().map((h) => h.confidence),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.12)',
      fill: true,
      tension: 0.45,
    }],
  };

  return (
    <div className="fade-in">
      <div className="welcome-banner mb-4">
        <div className="row align-items-center">
          <div className="col-lg-7">
            <span className="premium-badge mb-2 d-inline-block">AI Mental Health Command Center</span>
            <h1 className="mb-2" style={{ WebkitTextFillColor: 'unset', color: 'var(--mw-text)', fontSize: '1.85rem' }}>
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} ✨
            </h1>
            <p className="text-muted mb-2">Track mood, sleep, assessments & get ML-powered depression risk insights.</p>
            {streaks?.moodStreak > 0 && (
              <span className="streak-badge"><i className="bi bi-fire" /> {streaks.moodStreak} day mood streak!</span>
            )}
          </div>
          <div className="col-lg-5 text-lg-end mt-3 mt-lg-0">
            <Link to="/achievements" className="btn btn-outline-primary rounded-pill me-2"><i className="bi bi-trophy" /> {badges} Badges</Link>
            <Link to="/assessment" className="btn btn-mw-primary"><i className="bi bi-cpu me-1" /> Run Assessment</Link>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {QUICK.map((a) => (
          <Link key={a.to} to={a.to} className="quick-action-card" style={{ minWidth: 90, flex: '1 1 90px' }}>
            <i className={`bi ${a.icon}`} style={{ background: `linear-gradient(135deg, ${a.color}, var(--mw-accent))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
            <span className="small fw-semibold">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="bento-grid mb-4">
        <div className="bento-item bento-span-4">
          {wellness ? (
            <>
              <h6 className="text-muted text-uppercase small mb-3">Wellness Score</h6>
              <WellnessScoreRing score={wellness.score} grade={wellness.grade} color={wellness.color} />
              <ul className="list-unstyled small mt-3 mb-0">
                {wellness.factors?.slice(0, 3).map((f, i) => (
                  <li key={i} className="d-flex justify-content-between py-1">
                    <span className="text-muted">{f.label}</span>
                    <span className={f.impact >= 0 ? 'text-success' : 'text-danger'}>{f.impact > 0 ? '+' : ''}{f.impact}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : <div className="shimmer" style={{ height: 120 }} />}
        </div>

        <div className="bento-item bento-span-4">
          <h6 className="text-muted text-uppercase small">Risk Status</h6>
          <div className="mt-3 mb-2">{riskBadge(latest?.prediction)}</div>
          <p className="text-muted small mb-0">AI Confidence: <strong>{latest?.confidence ?? '—'}%</strong></p>
          <Link to="/analytics" className="btn btn-sm btn-outline-primary mt-3">View Analytics</Link>
        </div>

        <div className="bento-item bento-span-4">
          <h6 className="text-muted text-uppercase small">This Week</h6>
          <div className="row g-2 mt-2">
            <div className="col-6"><div className="stat-value fs-4">{report?.moodEntries ?? 0}</div><small className="text-muted">Mood logs</small></div>
            <div className="col-6"><div className="stat-value fs-4">{report?.avgMood ?? '—'}</div><small className="text-muted">Avg mood</small></div>
            <div className="col-6"><div className="stat-value fs-4">{report?.assessments ?? 0}</div><small className="text-muted">Assessments</small></div>
            <div className="col-6"><div className="stat-value fs-4">{streaks?.totalJournals ?? 0}</div><small className="text-muted">Journals</small></div>
          </div>
        </div>

        {insights?.hasComparison && (
          <div className="bento-item bento-span-6">
            <h6><i className="bi bi-arrow-left-right text-primary me-2" />Assessment Trends</h6>
            <div className="d-flex gap-4 mt-2">
              {insights.deltas?.sleep_score != null && (
                <div><small className="text-muted">Sleep</small><div className={`fw-bold fs-5 ${insights.deltas.sleep_score >= 0 ? 'text-success' : 'text-danger'}`}>{insights.deltas.sleep_score > 0 ? '+' : ''}{insights.deltas.sleep_score}</div></div>
              )}
              {insights.deltas?.stress_score != null && (
                <div><small className="text-muted">Stress</small><div className={`fw-bold fs-5 ${insights.deltas.stress_score <= 0 ? 'text-success' : 'text-danger'}`}>{insights.deltas.stress_score > 0 ? '+' : ''}{insights.deltas.stress_score}</div></div>
              )}
            </div>
          </div>
        )}

        <div className={`bento-item ${insights?.hasComparison ? 'bento-span-6' : 'bento-span-12'}`}>
          <div className="d-flex justify-content-between mb-2">
            <h6 className="mb-0"><i className="bi bi-graph-up text-primary me-2" />AI Confidence Trend</h6>
            <Link to="/calendar" className="btn btn-sm btn-link">Mood Calendar</Link>
          </div>
          {history.length > 0 ? <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} /> : (
            <p className="text-muted text-center py-4">Complete an assessment to unlock charts</p>
          )}
        </div>

        {report?.tips?.[0] && (
          <div className="bento-item bento-span-12" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(34,211,238,0.05))' }}>
            <i className="bi bi-lightbulb text-warning me-2" />
            <strong>AI Tip:</strong> {report.tips[0]}
          </div>
        )}
      </div>
    </div>
  );
}
