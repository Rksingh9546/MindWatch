import React, { useEffect, useState } from 'react';
import { addJournal, deleteJournal, getJournals } from '../services/api';

const MOOD_TAGS = ['Grateful', 'Anxious', 'Calm', 'Sad', 'Hopeful', 'Stressed', 'Energetic'];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodTag, setMoodTag] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => getJournals().then((r) => setEntries(r.data.journals || []));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await addJournal({ title, content, moodTag });
    setTitle('');
    setContent('');
    setMoodTag('');
    setLoading(false);
    load();
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Private Journal</h1>
        <p className="text-muted">Reflect on your thoughts — entries are stored securely</p>
      </div>
      <div className="row g-4">
        <div className="col-lg-5">
          <form onSubmit={handleSubmit} className="card-mw p-4 bento-item">
            <h5><i className="bi bi-pencil-square text-primary me-2" />New Entry</h5>
            <input className="form-control mb-3" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea className="form-control mb-3" rows={6} placeholder="What's on your mind today?" value={content} onChange={(e) => setContent(e.target.value)} required />
            <div className="d-flex flex-wrap gap-2 mb-3">
              {MOOD_TAGS.map((t) => (
                <button key={t} type="button" className={`btn btn-sm ${moodTag === t ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setMoodTag(t)}>{t}</button>
              ))}
            </div>
            <button type="submit" className="btn btn-mw-primary w-100" disabled={loading}>Save Entry</button>
          </form>
        </div>
        <div className="col-lg-7">
          <div className="card-mw p-4">
            <h5 className="mb-3">Past Entries</h5>
            {entries.length === 0 ? <p className="text-muted">No journal entries yet.</p> : entries.map((e) => (
              <div key={e.id} className="journal-entry">
                <div className="d-flex justify-content-between">
                  <strong>{e.title || 'Untitled'}</strong>
                  <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => deleteJournal(e.id).then(load)}><i className="bi bi-trash" /></button>
                </div>
                {e.moodTag && <span className="badge bg-primary bg-opacity-25 text-primary me-2">{e.moodTag}</span>}
                <small className="text-muted">{new Date(e.createdAt).toLocaleString()}</small>
                <p className="mt-2 mb-0 text-muted">{e.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
