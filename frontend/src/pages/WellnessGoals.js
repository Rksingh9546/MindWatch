import React, { useEffect, useState } from 'react';
import { createGoal, deleteGoal, getGoals, updateGoal } from '../services/api';

const CATEGORIES = [
  { id: 'sleep', label: 'Sleep', icon: 'bi-moon' },
  { id: 'activity', label: 'Activity', icon: 'bi-bicycle' },
  { id: 'mindfulness', label: 'Mindfulness', icon: 'bi-wind' },
  { id: 'social', label: 'Social', icon: 'bi-people' },
  { id: 'general', label: 'General', icon: 'bi-star' },
];

export default function WellnessGoals() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [target, setTarget] = useState(7);

  const load = () => getGoals().then((r) => setGoals(r.data.goals || []));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createGoal({ title, category, target, unit: 'days' });
    setTitle('');
    load();
  };

  const increment = async (g) => {
    await updateGoal(g.id, { progress: g.progress + 1 });
    load();
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Wellness Goals</h1>
        <p className="text-muted">Set targets and track your progress with streaks</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <form onSubmit={handleCreate} className="card-mw p-4">
            <h5 className="mb-3"><i className="bi bi-plus-circle text-primary me-2" />New Goal</h5>
            <input className="form-control mb-3" placeholder="e.g. Meditate 10 min daily" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <select className="form-select mb-3" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <label className="form-label">Target (days)</label>
            <input type="number" className="form-control mb-3" min={1} max={90} value={target} onChange={(e) => setTarget(+e.target.value)} />
            <button type="submit" className="btn btn-mw-primary w-100">Add Goal</button>
          </form>
        </div>
        <div className="col-lg-8">
          <div className="row g-3">
            {goals.length === 0 ? (
              <div className="col-12"><div className="card-mw p-5 text-center text-muted">No goals yet. Create your first wellness goal!</div></div>
            ) : goals.map((g) => {
              const pct = Math.min(100, Math.round((g.progress / g.target) * 100));
              const cat = CATEGORIES.find((c) => c.id === g.category) || CATEGORIES[4];
              const done = g.progress >= g.target;
              return (
                <div className="col-md-6" key={g.id}>
                  <div className={`card-mw p-4 h-100 ${done ? 'border border-success border-opacity-50' : ''}`}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="badge bg-primary bg-opacity-25 text-primary"><i className={`bi ${cat.icon} me-1`} />{cat.label}</span>
                      <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => deleteGoal(g.id).then(load)}><i className="bi bi-trash" /></button>
                    </div>
                    <h6>{g.title}</h6>
                    <div className="progress mb-2" style={{ height: 8 }}>
                      <div className="progress-bar" style={{ width: `${pct}%`, background: done ? '#10b981' : 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">{g.progress}/{g.target} days</small>
                      {!done && (
                        <button type="button" className="btn btn-sm btn-mw-primary" onClick={() => increment(g)}>
                          <i className="bi bi-plus-lg" /> Day
                        </button>
                      )}
                      {done && <span className="badge bg-success"><i className="bi bi-trophy me-1" />Done!</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
