import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name });
      const updated = { ...user, name };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      setMsg('success');
    } catch {
      setMsg('error');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Profile</h1>
        <p className="text-muted">Manage your account settings</p>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card-mw p-4 text-center mb-4">
            <div className="brand-logo mx-auto mb-3" style={{ width: 72, height: 72, fontSize: '2rem' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h4>{user?.name}</h4>
            <p className="text-muted">{user?.email}</p>
            {user?.isAdmin && <span className="badge bg-danger">Administrator</span>}
          </div>
          <div className="card-mw p-4">
            {msg === 'success' && <div className="alert alert-success py-2">Profile updated!</div>}
            {msg === 'error' && <div className="alert alert-danger py-2">Update failed</div>}
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label">Display Name</label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" value={user?.email || ''} disabled />
              </div>
              <button type="submit" className="btn btn-mw-primary w-100">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
