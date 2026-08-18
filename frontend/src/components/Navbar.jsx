import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
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
    <nav className="home-nav" role="navigation" aria-label="Main navigation">
      <div className="home-nav-inner">

        {/* LEFT — Profile avatar */}
        <button
          id="nav-profile-btn"
          className="nav-avatar-btn"
          onClick={() => navigate('/profile')}
          title={`Profile: ${user?.name || 'Chef'}`}
          aria-label="Go to your profile"
        >
          <div className="nav-avatar" aria-hidden="true">
            {getInitials(user?.name)}
          </div>
          <span className="nav-username">{user?.name?.split(' ')[0] || 'Chef'}</span>
        </button>

        {/* CENTER — Logo */}
        <button
          id="nav-logo-btn"
          className="nav-logo"
          onClick={() => navigate('/')}
          aria-label="Let's Cook — go to home"
        >
          <span className="nav-logo-icon" aria-hidden="true">🍳</span>
          <span className="nav-logo-text">Let's Cook</span>
        </button>

        {/* RIGHT — Favorites + Logout */}
        <div className="nav-actions">
          <button
            id="nav-favorites-btn"
            className="nav-icon-btn"
            onClick={() => navigate('/favorites')}
            title="My Favorites"
            aria-label="Go to favorites"
          >
            <Heart size={22} aria-hidden="true" />
          </button>
          <button
            id="nav-logout-btn"
            className="nav-icon-btn"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={22} aria-hidden="true" />
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
