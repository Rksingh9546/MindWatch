import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { addSleepLog, getSleepLogs } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function SleepTracker() {
  const [logs, setLogs] = useState([]);
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState(6);
  const [note, setNote] = useState('');

  const load = () => getSleepLogs().then((r) => setLogs(r.data.sleepLogs || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addSleepLog({ hours, quality, note });
    setNote('');
    load();
  };

  const chartData = {
    labels: logs.slice(0, 14).reverse().map((l) => new Date(l.createdAt).toLocaleDateString(undefined, { weekday: 'short' })),
    datasets: [
      { label: 'Hours', data: logs.slice(0, 14).reverse().map((l) => l.hours), backgroundColor: 'rgba(99, 102, 241, 0.7)', borderRadius: 8 },
      { label: 'Quality', data: logs.slice(0, 14).reverse().map((l) => l.quality), backgroundColor: 'rgba(34, 211, 238, 0.6)', borderRadius: 8 },
    ],
  };

  const avgHours = logs.length ? (logs.reduce((s, l) => s + l.hours, 0) / logs.length).toFixed(1) : '—';

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Sleep Tracker</h1>
        <p className="text-muted">Log sleep duration & quality — vital for mental health AI predictions</p>
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-4"><div className="stat-card"><div className="stat-label">Avg Sleep</div><div className="stat-value">{avgHours}h</div></div></div>
        <div className="col-md-4"><div className="stat-card"><div className="stat-label">Entries</div><div className="stat-value">{logs.length}</div></div></div>
        <div className="col-md-4"><div className="stat-card"><div className="stat-label">Target</div><div className="stat-value">7–9h</div></div></div>
      </div>
      <div className="row g-4">
        <div className="col-lg-4">
          <form onSubmit={handleSubmit} className="card-mw p-4">
            <h5><i className="bi bi-moon-stars text-primary me-2" />Log Sleep</h5>
            <label className="form-label">Hours slept: {hours}h</label>
            <input type="range" className="form-range" min={0} max={12} step={0.5} value={hours} onChange={(e) => setHours(+e.target.value)} />
            <label className="form-label">Quality: {quality}/10</label>
            <input type="range" className="form-range" min={1} max={10} value={quality} onChange={(e) => setQuality(+e.target.value)} />
            <textarea className="form-control mb-3" rows={2} placeholder="Notes" value={note} onChange={(e) => setNote(e.target.value)} />
            <button type="submit" className="btn btn-mw-primary w-100">Save</button>
          </form>
        </div>
        <div className="col-lg-8">
          <div className="card-mw p-4">
            <h5 className="mb-3">Sleep History</h5>
            {logs.length > 0 ? <Bar data={chartData} options={{ responsive: true }} /> : <p className="text-muted text-center py-5">No sleep data yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
