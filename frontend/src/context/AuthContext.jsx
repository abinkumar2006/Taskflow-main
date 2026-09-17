import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loginUser, registerUser, fetchMe } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Validate stored token on first load; clears stale sessions.
    async function verify() {
      const stored = localStorage.getItem('token');
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const { user: freshUser } = await fetchMe();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (credentials) => {
    setAuthError('');
    try {
      const { user: loggedUser, token: newToken } = await loginUser(credentials);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      setToken(newToken);
      return true;
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed. Please try again.');
      return false;
    }
  }, []);

  const register = useCallback(async (payload) => {
    setAuthError('');
    try {
      const { user: newUser, token: newToken } = await registerUser(payload);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      setToken(newToken);
      return true;
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = errors?.length
        ? errors.map((e) => e.message).join(', ')
        : err.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, authError, login, register, logout, setAuthError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
