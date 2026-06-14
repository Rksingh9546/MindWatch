import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AnimatedBackground />
      <div className="auth-bg" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="auth-card fade-in">
        <div className="text-center mb-4">
          <div className="brand-logo mx-auto mb-3" style={{ width: 56, height: 56, fontSize: '1.5rem' }}>
            <i className="bi bi-heart-pulse-fill" />
          </div>
          <h2 className="mb-1">Welcome Back</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>AI Mental Health Monitoring System</p>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label"><i className="bi bi-envelope me-1" /> Email</label>
            <input type="email" className="form-control" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label"><i className="bi bi-lock me-1" /> Password</label>
            <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-mw-primary w-100 py-2" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : <><i className="bi bi-box-arrow-in-right me-2" />Sign In</>}
          </button>
        </form>

        <div className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
          <Link to="/welcome" className="d-block mb-2 opacity-75">← Back to home</Link>
          <Link to="/forgot-password">Forgot password?</Link>
          <span className="mx-2 opacity-50">·</span>
          <Link to="/register">Create account</Link>
        </div>
        <p className="text-center mt-3 mb-0 small" style={{ color: 'rgba(255,255,255,0.45)' }}>
          
        </p>
      </div>
    </div>
  );
}
