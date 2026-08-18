import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { requestResetOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please provide your email address');
      return;
    }

    setLoading(true);
    try {
      const data = await requestResetOtp(email);
      if (data.success) {
        setSuccess('If the email is valid, a reset code has been sent.');
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-logo">🍳 Let's Cook</h1>
        <p className="auth-subtitle">Forgot Password</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Enter your email and we'll send you an OTP to reset your password.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <span className="input-icon-left"><Mail size={18} /></span>
            <input
              type="email"
              id="email"
              placeholder="chef@letscook.com"
              className="form-input form-input-has-icon-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled={loading}>
          {loading ? (
            <span className="spinner"></span>
          ) : (
            <>
              Send Reset Code <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="auth-footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
