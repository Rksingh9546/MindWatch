import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-card fade-in">
        <h2 className="text-center mb-3">Reset Password</h2>
        {sent ? (
          <div className="alert alert-success">
            If an account exists for <strong>{email}</strong>, reset instructions would be sent via Firebase Auth in production.
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-mw-primary w-100">Send Reset Link</button>
          </form>
        )}
        <Link to="/login" className="d-block text-center mt-4">Back to sign in</Link>
      </div>
    </div>
  );
}
