import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Heart, MessageSquare, Award, Play } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div style={{ padding: '20px', width: '100%' }}>
      <div className="dashboard-container">
        <div className="dashboard-hero">
          <h2>🍳 Let's Cook Dashboard</h2>
          <p>Welcome back to your ultimate culinary workspace!</p>
          <button 
            onClick={handleLogout} 
            className="btn" 
            style={{ 
              position: 'absolute', 
              top: '20px', 
              right: '20px', 
              width: 'auto', 
              padding: '0.5rem 1rem', 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px'
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="dashboard-content">
          <div className="profile-card">
            <div className="profile-avatar">
              {getInitials(user?.name)}
            </div>
            <div className="profile-details">
              <h3>{user?.name || 'Chef Gastronomer'}</h3>
              <p>{user?.email}</p>
              <div>
                <span className="badge badge-success">
                  ✓ Verified Account
                </span>
                {user?.googleId && (
                  <span className="badge" style={{ background: 'rgba(66, 133, 244, 0.15)', color: '#4285F4', marginLeft: '8px' }}>
                    Google Authenticated
                  </span>
                )}
              </div>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'left' }}>
            Culinary Modules (Coming Soon)
          </h3>
          
          <div className="dashboard-features">
            <div className="feature-box">
              <div className="feature-icon"><BookOpen size={24} /></div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--sans)', fontWeight: 600 }}>Recipe Management</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Create, edit, and categorize your secret cooking recipes.</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon"><Heart size={24} /></div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--sans)', fontWeight: 600 }}>Favorites</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bookmark recipes from other chefs around the globe.</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon"><Play size={24} /></div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--sans)', fontWeight: 600 }}>Cooking Tutorials</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Watch step-by-step YouTube videos integrated directly.</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon"><MessageSquare size={24} /></div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--sans)', fontWeight: 600 }}>AI Cooking Assistant</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Get ingredient suggestions and substitution queries answered instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
