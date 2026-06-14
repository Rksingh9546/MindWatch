import React, { useEffect, useState } from 'react';
import { getMoodCalendar } from '../services/api';

function moodColor(score) {
  if (score >= 8) return '#10b981';
  if (score >= 6) return '#6366f1';
  if (score >= 4) return '#f59e0b';
  return '#ef4444';
}

export default function Calendar() {
  const [calendar, setCalendar] = useState([]);

  useEffect(() => {
    getMoodCalendar().then((r) => setCalendar(r.data.calendar || []));
  }, []);

  const map = Object.fromEntries(calendar.map((c) => [c.date, c.mood]));

  const weeks = [];
  const today = new Date();
  for (let w = 12; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - w * 7 - (6 - d));
      const key = date.toISOString().slice(0, 10);
      week.push({ date: key, mood: map[key], label: date.getDate() });
    }
    weeks.push(week);
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Mood Calendar</h1>
        <p className="text-muted">GitHub-style heatmap of your emotional wellness over 90 days</p>
      </div>
      <div className="card-mw p-4">
        <div className="d-flex flex-wrap gap-3 mb-4 small">
          <span><span className="heatmap-cell d-inline-block heatmap-empty" style={{ width: 14, height: 14 }} /> No data</span>
          {[4, 6, 8, 10].map((m) => (
            <span key={m}><span className="heatmap-cell d-inline-block" style={{ width: 14, height: 14, background: moodColor(m) }} /> {m}+</span>
          ))}
        </div>
        <div className="overflow-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="d-flex gap-1 mb-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`heatmap-cell ${day.mood ? '' : 'heatmap-empty'}`}
                  style={{ width: 28, height: 28, background: day.mood ? moodColor(day.mood) : undefined }}
                  title={day.mood ? `${day.date}: Mood ${day.mood}/10` : day.date}
                />
              ))}
            </div>
          ))}
        </div>
        <p className="text-muted small mt-3 mb-0">{calendar.length} days with mood data logged</p>
      </div>
    </div>
  );
}
