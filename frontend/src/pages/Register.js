import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', icon: 'bi-person', type: 'text', ph: 'John Doe' },
    { key: 'email', label: 'Email', icon: 'bi-envelope', type: 'email', ph: 'you@email.com' },
    { key: 'password', label: 'Password', icon: 'bi-lock', type: 'password', ph: 'Min 6 characters' },
    { key: 'confirm', label: 'Confirm Password', icon: 'bi-shield-check', type: 'password', ph: 'Repeat password' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-card fade-in">
        <div className="text-center mb-4">
          <h2>Join MindWatch AI</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Start your mental wellness journey</p>
        </div>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        <form onSubmit={handleSubmit}>
          {fields.map((f) => (
            <div className="mb-3" key={f.key}>
              <label className="form-label"><i className={`bi ${f.icon} me-1`} />{f.label}</label>
              <input
                type={f.type}
                className="form-control"
                placeholder={f.ph}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                required
              />
            </div>
          ))}
          <button type="submit" className="btn btn-mw-primary w-100 py-2" disabled={loading}>
            {loading ? 'Creating account...' : <><i className="bi bi-person-plus me-2" />Create Account</>}
          </button>
        </form>
        <p className="text-center mt-4 mb-0"><Link to="/login">Already have an account? Sign in</Link></p>
      </div>
    </div>
  );
}
