import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';

const ResetPassword = () => {
  const { verifyResetOtp, resetPass, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  // Steps: 'verify_otp' | 'new_password'
  const [step, setStep] = useState('verify_otp');
  const [resetToken, setResetToken] = useState('');

  // OTP inputs
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // New password inputs
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      setError('Missing email address in URL');
    }
  }, [email]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return;

    const digits = pasteData.split('');
    setOtp(digits);
    inputRefs.current[5].focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please fill in all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyResetOtp(email, otpCode);
      if (data.success && data.resetToken) {
        setResetToken(data.resetToken);
        setSuccess('OTP verified successfully!');
        setTimeout(() => {
          setSuccess('');
          setStep('new_password');
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
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
      const data = await resetPass(resetToken, password, confirmPassword);
      if (data.success) {
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-logo">🍳 Let's Cook</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--primary)' }}>
          {step === 'verify_otp' ? 'Verify Reset Code' : 'Create New Password'}
        </h2>
        <p className="auth-subtitle">
          {step === 'verify_otp'
            ? `Enter the 6-digit OTP code sent to ${email}`
            : 'Choose a secure, strong password for your account'}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {step === 'verify_otp' ? (
        <form onSubmit={handleVerifyOtp}>
          <div className="otp-inputs" onPaste={handleOtpPaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="otp-box"
                disabled={loading || !email}
              />
            ))}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !email}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <ShieldCheck size={18} /> Verify Code
              </>
            )}
          </button>

          <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="form-group">
            <label className="form-label" htmlFor="password">New Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><Lock size={18} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="At least 6 characters"
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
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left"><Lock size={18} /></span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Repeat new password"
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
                <CheckCircle2 size={18} /> Reset Password
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
