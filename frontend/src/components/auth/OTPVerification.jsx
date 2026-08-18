import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, RefreshCw } from 'lucide-react';

const OTPVerification = () => {
  const { verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Resend Countdown
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      setError('No email address provided. Please register first.');
    }
  }, [email]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    // Only allow single numbers
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Get last typed char
    setOtp(newOtp);

    // Auto-focus next box
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: clear box and focus previous
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

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return; // verify exactly 6 digits

    const digits = pasteData.split('');
    setOtp(digits);
    // Focus last input
    inputRefs.current[5].focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    setLoading(true);
    try {
      const data = await verifyEmail(email, otpCode);
      if (data.success) {
        setSuccess('Email verified successfully! Opening your kitchen dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setSuccess('');
    
    try {
      const data = await resendOtp(email);
      if (data.success) {
        setSuccess('A new verification code has been sent!');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-logo">🍳 Let's Cook</h1>
        <p className="auth-subtitle">Verify Your Account</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          We've sent a 6-digit OTP code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
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
              <ShieldCheck size={18} /> Verify OTP
            </>
          )}
        </button>
      </form>

      <div className="timer-text">
        {canResend ? (
          <button 
            type="button" 
            onClick={handleResend} 
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={14} /> Resend OTP
          </button>
        ) : (
          <>
            Resend OTP code in <span className="timer-highlight">{timer}s</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;
