import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on load
  const checkAuthStatus = async () => {
    try {
      const data = await authService.getCurrentUser();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // Don't log noisy errors for unauthenticated users on load
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.loginUser({ email, password });
      if (data.success && data.user) {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    setLoading(true);
    try {
      const data = await authService.registerUser({ name, email, password, confirmPassword });
      return data;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, otp) => {
    setLoading(true);
    try {
      const data = await authService.verifyEmailOtp(email, otp);
      if (data.success && data.user) {
        setUser(data.user);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email) => {
    return await authService.resendVerificationOtp(email);
  };

  const requestResetOtp = async (email) => {
    return await authService.requestPasswordResetOtp(email);
  };

  const verifyResetOtp = async (email, otp) => {
    return await authService.verifyPasswordResetOtp(email, otp);
  };

  const resetPass = async (resetToken, password, confirmPassword) => {
    return await authService.resetPassword({ resetToken, password, confirmPassword });
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logoutUser();
    } catch (error) {
      console.error('Logout error:', error.message);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyEmail,
        resendOtp,
        requestResetOtp,
        verifyResetOtp,
        resetPass,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
