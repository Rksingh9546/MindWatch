import React, { useEffect, useState } from 'react';
import { exportMyData, getSettings, saveSettings } from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((r) => setSettings(r.data));
  }, []);

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExport = async () => {
    const res = await exportMyData();
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mindwatch-my-data.json';
    a.click();
  };

  if (!settings) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  const toggles = [
    { key: 'dailyReminder', label: 'Daily wellness reminder', desc: 'Get reminded to log mood & check in' },
    { key: 'emailAlerts', label: 'Email alerts', desc: 'Receive assessment summary emails (requires SMTP)' },
    { key: 'shareAnalytics', label: 'Anonymous analytics', desc: 'Help improve MindWatch with anonymized usage data' },
    { key: 'crisisQuickAccess', label: 'Crisis quick access', desc: 'Show crisis resources button in sidebar' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Settings</h1>
        <p className="text-muted">Customize your MindWatch experience</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card-mw p-4 mb-4">
            <h5 className="mb-3">Preferences</h5>
            {toggles.map((t) => (
              <div key={t.key} className="d-flex justify-content-between align-items-center py-3 border-bottom border-opacity-10">
                <div>
                  <div className="fw-semibold">{t.label}</div>
                  <small className="text-muted">{t.desc}</small>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" checked={!!settings[t.key]} onChange={(e) => update(t.key, e.target.checked)} />
                </div>
              </div>
            ))}
            {settings.dailyReminder && (
              <div className="mt-3">
                <label className="form-label">Reminder time</label>
                <input type="time" className="form-control" style={{ maxWidth: 160 }} value={settings.reminderTime || '09:00'} onChange={(e) => update('reminderTime', e.target.value)} />
              </div>
            )}
            <button type="button" className="btn btn-mw-primary mt-4" onClick={handleSave}>
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card-mw p-4">
            <h6><i className="bi bi-download text-primary me-2" />Export My Data</h6>
            <p className="text-muted small">Download all your assessments, moods, and goals as JSON (GDPR-friendly).</p>
            <button type="button" className="btn btn-outline-primary w-100" onClick={handleExport}>Download JSON</button>
          </div>
        </div>
      </div>
    </div>
  );
}
