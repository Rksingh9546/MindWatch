import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitAssessment } from '../services/api';

const initial = {
  sleep_score: 7,
  sleep_variance: 1.5,
  stress_score: 4,
  stress_variance: 1.2,
  walking_pct: 40,
  running_pct: 10,
  stationary_pct: 50,
  activity_level: 6,
};

const fields = [
  { key: 'sleep_score', label: 'Sleep Score', icon: 'bi-moon-stars', min: 1, max: 10, step: 0.1, hint: 'Quality of sleep (1=poor, 10=excellent)' },
  { key: 'sleep_variance', label: 'Sleep Variance', icon: 'bi-bar-chart', min: 0, max: 5, step: 0.1 },
  { key: 'stress_score', label: 'Stress Score', icon: 'bi-lightning', min: 1, max: 10, step: 0.1 },
  { key: 'stress_variance', label: 'Stress Variance', icon: 'bi-activity', min: 0, max: 5, step: 0.1 },
  { key: 'walking_pct', label: 'Walking %', icon: 'bi-person-walking', min: 0, max: 100, step: 1 },
  { key: 'running_pct', label: 'Running %', icon: 'bi-heart-pulse', min: 0, max: 100, step: 1 },
  { key: 'stationary_pct', label: 'Stationary %', icon: 'bi-pause-circle', min: 0, max: 100, step: 1 },
  { key: 'activity_level', label: 'Activity Level', icon: 'bi-bicycle', min: 1, max: 10, step: 0.1 },
];

export default function Assessment() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const total = form.walking_pct + form.running_pct + form.stationary_pct;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await submitAssessment(form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const riskClass = result?.prediction?.includes('High') ? 'risk-high' : result?.prediction?.includes('Moderate') ? 'risk-moderate' : 'risk-low';

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Mental Health Assessment</h1>
        <p className="text-muted">AI analyzes sleep, stress & activity to predict depression risk</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {result && (
        <div className="card-mw p-4 mb-4" style={{ borderLeft: '4px solid var(--mw-primary)' }}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <h4 className="mb-2"><i className="bi bi-cpu text-primary me-2" />AI Prediction Complete</h4>
              <span className={`risk-badge ${riskClass} fs-6`}>{result.prediction}</span>
              <span className="ms-3 text-muted">Confidence: <strong>{result.confidence}%</strong></span>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <button className="btn btn-mw-primary me-2" onClick={() => navigate('/recommendations')}>Recommendations</button>
              <button className="btn btn-outline-primary" onClick={() => navigate('/chat')}>Ask AI</button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-mw p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">Behavioral Indicators</h5>
          <span className={`badge ${Math.abs(total - 100) <= 2 ? 'bg-success' : 'bg-warning'}`}>
            Activity total: {total.toFixed(0)}% {Math.abs(total - 100) > 2 && '(should be ~100%)'}
          </span>
        </div>
        <div className="row g-4">
          {fields.map((f) => (
            <div className="col-md-6" key={f.key}>
              <label className="form-label fw-semibold">
                <i className={`bi ${f.icon} me-1 text-primary`} />{f.label}
              </label>
              <input
                type="range"
                className="form-range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: parseFloat(e.target.value) })}
              />
              <div className="d-flex justify-content-between">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  style={{ width: 80 }}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: parseFloat(e.target.value) })}
                />
                {f.hint && <small className="text-muted">{f.hint}</small>}
              </div>
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-mw-primary btn-lg mt-4 px-5" disabled={loading}>
          {loading ? <><span className="spinner-border spinner-border-sm me-2" />Analyzing with AI...</> : <><i className="bi bi-cpu me-2" />Run AI Prediction</>}
        </button>
      </form>
    </div>
  );
}
