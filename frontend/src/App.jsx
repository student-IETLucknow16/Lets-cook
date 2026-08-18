
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// ── Auth Pages (untouched) ──────────────────────────────────────────────────
import Login        from './pages/Login';
import Register     from './pages/Register';
import VerifyEmail  from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';

// ── App Pages ───────────────────────────────────────────────────────────────
import Home      from './pages/Home';
import Profile   from './pages/Profile';
import Favorites from './pages/Favorites';

// ── Recipe Pages ─────────────────────────────────────────────────────────────
import Recipes       from './pages/Recipes';
import RecipeDetails from './pages/RecipeDetails';
import AddRecipe     from './pages/AddRecipe';

// ── Route Guards ─────────────────────────────────────────────────────────────

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Existing behaviour preserved exactly as before.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="screen-center">
        <div className="spinner spinner-dark" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * PublicRoute — prevents logged-in users from revisiting auth pages.
 * Existing behaviour preserved exactly as before.
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="screen-center">
        <div className="spinner spinner-dark" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* ── Public Auth Routes (no changes to logic) ── */}
          <Route
            path="/login"
            element={<PublicRoute><Login /></PublicRoute>}
          />
          <Route
            path="/register"
            element={<PublicRoute><Register /></PublicRoute>}
          />
          <Route path="/verify-email"    element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* ── Protected App Routes ── */}
          <Route
            path="/"
            element={<ProtectedRoute><Home /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/favorites"
            element={<ProtectedRoute><Favorites /></ProtectedRoute>}
          />

          {/* ── Protected Recipe Routes ── */}
          <Route
            path="/recipes"
            element={<ProtectedRoute><Recipes /></ProtectedRoute>}
          />
          <Route
            path="/recipes/:id"
            element={<ProtectedRoute><RecipeDetails /></ProtectedRoute>}
          />
          <Route
            path="/add-recipe"
            element={<ProtectedRoute><AddRecipe /></ProtectedRoute>}
          />

          {/* Legacy /dashboard redirect — keeps old bookmarks working */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
