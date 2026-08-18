import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Profile — Placeholder page.
 * Displays the authenticated user's basic info from AuthContext.
 * Full profile editing will be implemented in a future task.
 */
const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="placeholder-page">
      <div className="placeholder-card" role="main" aria-label="Profile page">

        <button
          id="profile-back-btn"
          className="back-btn"
          onClick={() => navigate('/')}
          aria-label="Go back to home"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back to Home</span>
        </button>

        <div className="profile-avatar-lg" aria-hidden="true">
          {getInitials(user?.name)}
        </div>

        <h1 className="placeholder-title">{user?.name || 'Chef'}</h1>

        <div className="profile-info-row">
          <Mail size={15} aria-hidden="true" />
          <span className="placeholder-email">{user?.email}</span>
        </div>

        <div className="profile-badges">
          <span className="badge badge-success">✓ Verified Account</span>
          {user?.googleId && (
            <span
              className="badge"
              style={{ background: 'rgba(66,133,244,0.12)', color: '#4285F4' }}
            >
              Google Account
            </span>
          )}
        </div>

        <p className="placeholder-note">
          Full profile management — avatar upload, bio, and preferences — is coming soon.
        </p>

        <button
          id="profile-logout-btn"
          className="btn btn-primary"
          style={{ width: 'auto', padding: '0.65rem 1.75rem', marginTop: '0.5rem' }}
          onClick={handleLogout}
        >
          <LogOut size={16} aria-hidden="true" />
          Logout
        </button>

      </div>
    </div>
  );
};

export default Profile;
