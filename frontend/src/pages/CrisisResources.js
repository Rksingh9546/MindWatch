import React from 'react';

const HELPLINES = [
  { country: 'India', name: 'Vandrevala Foundation', number: '1860-2662-345', hours: '24/7' },
  { country: 'India', name: 'iCall', number: '9152987821', hours: 'Mon–Sat 8am–10pm' },
  { country: 'USA', name: '988 Suicide & Crisis Lifeline', number: '988', hours: '24/7' },
  { country: 'USA', name: 'Crisis Text Line', number: 'Text HOME to 741741', hours: '24/7' },
  { country: 'UK', name: 'Samaritans', number: '116 123', hours: '24/7' },
  { country: 'Global', name: 'International Association for Suicide Prevention', number: 'https://www.iasp.info/resources/Crisis_Centres/', hours: 'Directory' },
];

const TIPS = [
  { icon: 'bi-telephone-fill', title: 'Call someone now', text: 'Reach out to a trusted friend, family member, or professional.' },
  { icon: 'bi-hospital', title: 'Go to emergency', text: 'If you are in immediate danger, visit your nearest emergency department.' },
  { icon: 'bi-people-fill', title: 'You are not alone', text: 'Millions experience mental health challenges. Help is available.' },
];

export default function CrisisResources() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Crisis Resources</h1>
        <p className="text-muted">Immediate support — you deserve help right now</p>
      </div>

      <div className="alert border-0 mb-4" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.1))', borderLeft: '4px solid #ef4444' }}>
        <h5 className="text-danger mb-2"><i className="bi bi-exclamation-octagon me-2" />In an emergency?</h5>
        <p className="mb-0">If you or someone else is in immediate danger, call your local emergency number (e.g. <strong>112</strong> in India, <strong>911</strong> in US) right away.</p>
      </div>

      <div className="row g-3 mb-4">
        {TIPS.map((t) => (
          <div className="col-md-4" key={t.title}>
            <div className="card-mw p-4 h-100 text-center">
              <i className={`bi ${t.icon} display-6 text-primary mb-2`} />
              <h6>{t.title}</h6>
              <p className="text-muted small mb-0">{t.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-mw p-4">
        <h5 className="mb-3"><i className="bi bi-telephone-outbound text-primary me-2" />Helplines</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead><tr><th>Region</th><th>Service</th><th>Contact</th><th>Hours</th></tr></thead>
            <tbody>
              {HELPLINES.map((h, i) => (
                <tr key={i}>
                  <td><span className="badge bg-secondary">{h.country}</span></td>
                  <td className="fw-semibold">{h.name}</td>
                  <td><a href={h.number.startsWith('http') ? h.number : `tel:${h.number.replace(/\s/g, '')}`} className="text-primary fw-bold">{h.number}</a></td>
                  <td className="text-muted">{h.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
