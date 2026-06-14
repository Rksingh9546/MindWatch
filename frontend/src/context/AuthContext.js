import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProfile, loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      getProfile().catch(() => logout());
    }
    setLoading(false);
  }, []);

  const persist = (data, token) => {
    const u = {
      uid: data.uid,
      email: data.email,
      name: data.name,
      isAdmin: data.isAdmin || false,
    };
    localStorage.setItem('token', token || data.token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    return persist(res.data, res.data.token);
  };

  const register = async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    return persist(res.data, res.data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
