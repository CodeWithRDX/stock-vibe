import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync profile on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
      } catch (err) {
        // Clear stale credentials
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const userData = res.data.data;
      
      // Inject bearer header for immediately following requests
      if (userData.accessToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`;
      }
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      return res.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Server logout request failed', err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
