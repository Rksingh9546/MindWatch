import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import { addMood, getMoods } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const MOOD_EMOJIS = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩', '💪', '✨', '🌟'];

export default function MoodJournal() {
  const [moods, setMoods] = useState([]);
  const [moodScore, setMoodScore] = useState(6);
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => getMoods().then((r) => setMoods(r.data.moods || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await addMood({ mood_score: moodScore, energy, note });
      setNote('');
      setMsg('success');
      load();
    } catch {
      setMsg('error');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: moods.slice(0, 14).reverse().map((m) => new Date(m.createdAt).toLocaleDateString(undefined, { weekday: 'short' })),
    datasets: [
      { label: 'Mood', data: moods.slice(0, 14).reverse().map((m) => m.mood_score), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 },
      { label: 'Energy', data: moods.slice(0, 14).reverse().map((m) => m.energy), borderColor: '#22d3ee', tension: 0.4 },
    ],
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Mood Journal</h1>
        <p className="text-muted">Track daily mood & energy to spot patterns over time</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <form onSubmit={handleSubmit} className="card-mw p-4">
            <h5 className="mb-3"><i className="bi bi-journal-plus text-primary me-2" />Today's Check-in</h5>
            {msg === 'success' && <div className="alert alert-success py-2 small">Mood logged successfully!</div>}
            <div className="text-center mb-3 display-4">{MOOD_EMOJIS[moodScore - 1]}</div>
            <label className="form-label">Mood (1–10)</label>
            <input type="range" className="form-range" min={1} max={10} value={moodScore} onChange={(e) => setMoodScore(+e.target.value)} />
            <div className="text-center fw-bold mb-3">{moodScore}/10</div>
            <label className="form-label">Energy (1–10)</label>
            <input type="range" className="form-range" min={1} max={10} value={energy} onChange={(e) => setEnergy(+e.target.value)} />
            <div className="text-center fw-bold mb-3">{energy}/10</div>
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-control mb-3" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="How are you feeling today?" />
            <button type="submit" className="btn btn-mw-primary w-100" disabled={loading}>
              {loading ? 'Saving...' : 'Log Mood'}
            </button>
          </form>
        </div>
        <div className="col-lg-7">
          <div className="card-mw p-4 mb-4">
            <h5><i className="bi bi-graph-up text-primary me-2" />Mood Trend</h5>
            {moods.length > 0 ? <Line data={chartData} options={{ responsive: true }} /> : <p className="text-muted py-4 text-center">Log your first mood entry to see trends</p>}
          </div>
          <div className="card-mw p-4">
            <h6 className="mb-3">Recent Entries</h6>
            {moods.slice(0, 8).map((m) => (
              <div key={m.id} className="d-flex gap-3 py-2 border-bottom border-opacity-10">
                <span className="fs-4">{MOOD_EMOJIS[m.mood_score - 1]}</span>
                <div className="flex-grow-1">
                  <div className="fw-semibold">Mood {m.mood_score} · Energy {m.energy}</div>
                  {m.note && <div className="text-muted small">{m.note}</div>}
                  <small className="text-muted">{new Date(m.createdAt).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
