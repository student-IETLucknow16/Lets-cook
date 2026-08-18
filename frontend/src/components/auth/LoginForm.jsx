import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(searchParams.get('error') || '');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic frontend checks
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.success) {
        setSuccess('Logged in successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err) {
      // If user exists but is not verified, redirect them to the verification page
      if (err.message.includes('verify your email')) {
        setError(err.message);
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(err.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Simply redirect to backend OAuth entry endpoint
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-logo">🍳 Let's Cook</h1>
        <p className="auth-subtitle">Welcome back! Let's get cooking.</p>
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
              placeholder="you@example.com"
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
              placeholder="••••••••"
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

        <div className="forgot-password-link-container">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <span className="spinner"></span>
          ) : (
            <>
              <LogIn size={18} /> Login
            </>
          )}
        </button>
      </form>

      <div className="divider">or</div>

      <button type="button" className="btn btn-social" onClick={handleGoogleLogin} disabled={loading}>
        <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="auth-footer">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </div>
    </div>
  );
};

export default LoginForm;
