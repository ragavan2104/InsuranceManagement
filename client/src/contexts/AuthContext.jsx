import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [appLoading, setAppLoading] = useState(false);
  const [user, setUser] = useState({
    userId: localStorage.getItem('userId') || '',
    fullName: localStorage.getItem('fullName') || '',
    email: localStorage.getItem('email') || '',
    roleName: localStorage.getItem('roleName') || ''
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        setUser({
          userId: localStorage.getItem('userId') || '',
          fullName: localStorage.getItem('fullName') || '',
          email: localStorage.getItem('email') || '',
          roleName: localStorage.getItem('roleName') || ''
        });
      } else {
        setToken('');
        setUser({ userId: '', fullName: '', email: '', roleName: '' });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (loginData) => {
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('roleName', loginData.roleName);
    localStorage.setItem('userId', loginData.userId);
    localStorage.setItem('fullName', loginData.fullName);
    localStorage.setItem('email', loginData.email);

    setToken(loginData.token);
    setUser({
      userId: loginData.userId,
      fullName: loginData.fullName,
      email: loginData.email,
      roleName: loginData.roleName
    });
  };

  const logout = () => {
    localStorage.clear();
    setToken('');
    setUser({ userId: '', fullName: '', email: '', roleName: '' });
  };

  const startLoading = () => setAppLoading(true);
  const stopLoading = () => setAppLoading(false);

  return (
    <AuthContext.Provider value={{
      token,
      user,
      appLoading,
      login,
      logout,
      startLoading,
      stopLoading
    }}>
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
