import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Resources() {
  const [data, setData] = useState({ articles: [], videos: [], tools: [] });

  useEffect(() => {
    api.get('/resources').then((r) => setData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Wellness Library</h1>
        <p className="text-muted">Articles, guided tools, and mental health resources</p>
      </div>

      <h5 className="mb-3"><i className="bi bi-tools text-primary me-2" />Quick Tools</h5>
      <div className="row g-3 mb-5">
        {(data.tools || []).map((t) => (
          <div className="col-md-4" key={t.id}>
            <Link to={t.path} className="resource-card">
              <i className={`bi ${t.icon} fs-2 text-primary mb-2 d-block`} />
              <h6 className="mb-0">{t.title}</h6>
            </Link>
          </div>
        ))}
      </div>

      <h5 className="mb-3"><i className="bi bi-book text-primary me-2" />Articles</h5>
      <div className="row g-3 mb-5">
        {(data.articles || []).map((a) => (
          <div className="col-md-6" key={a.id}>
            <div className="resource-card">
              <div className="d-flex gap-3">
                <div className="stat-icon purple" style={{ width: 48, height: 48, fontSize: '1.2rem' }}><i className={`bi ${a.icon}`} /></div>
                <div>
                  <span className="badge bg-primary bg-opacity-25 text-primary mb-1">{a.category}</span>
                  <h6>{a.title}</h6>
                  <small className="text-muted"><i className="bi bi-clock me-1" />{a.readTime}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h5 className="mb-3"><i className="bi bi-play-btn text-primary me-2" />Guided Sessions</h5>
      <div className="row g-3">
        {(data.videos || []).map((v) => (
          <div className="col-md-6" key={v.id}>
            <div className="resource-card">
              <i className={`bi ${v.icon} fs-1 text-info mb-2`} />
              <h6>{v.title}</h6>
              <span className="text-muted small">{v.duration}</span>
              <Link to="/breathing" className="btn btn-sm btn-mw-primary mt-2">Try Breathing Tool</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
