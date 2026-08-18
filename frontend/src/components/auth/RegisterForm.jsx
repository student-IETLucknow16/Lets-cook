import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend Validations
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const data = await register(name, email, password, confirmPassword);
      if (data.success) {
        setSuccess('Registration initiated successfully! Please check your email for the OTP.');
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-logo">🍳 Let's Cook</h1>
        <p className="auth-subtitle">Join us to discover and share recipes!</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <div className="input-wrapper">
            <span className="input-icon-left"><User size={18} /></span>
            <input
              type="text"
              id="name"
              placeholder="Chef Gordon"
              className="form-input form-input-has-icon-left"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <span className="input-icon-left"><Mail size={18} /></span>
            <input
              type="email"
              id="email"
              placeholder=" Gordon@letscook.com"
              className="form-input form-input-has-icon-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="input-wrapper">
            <span className="input-icon-left"><Lock size={18} /></span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Minimum 6 characters"
              className="form-input form-input-has-icon-left form-input-has-icon-right"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="input-icon-right"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-wrapper">
            <span className="input-icon-left"><Lock size={18} /></span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Repeat your password"
              className="form-input form-input-has-icon-left form-input-has-icon-right"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="input-icon-right"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem' }} disabled={loading}>
          {loading ? (
            <span className="spinner"></span>
          ) : (
            <>
              <UserPlus size={18} /> Sign Up
            </>
          )}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default RegisterForm;
