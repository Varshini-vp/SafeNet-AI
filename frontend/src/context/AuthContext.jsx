import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('safenet_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('safenet_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('safenet_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Auth validation failed, clearing token');
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('safenet_token', res.data.token);
        localStorage.setItem('safenet_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.error || 'Unable to connect to SafeNet server';
      return { success: false, error: msg };
    }
  };

  const demoLogin = async (role = 'authority') => {
    const email = role === 'admin' ? 'admin@safenet.ai' : 'authority@safenet.ai';
    const password = role === 'admin' ? 'Admin@123' : 'Authority@123';
    return await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('safenet_token');
    localStorage.removeItem('safenet_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, logout, isAuthenticated: !!user, role: user?.role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
