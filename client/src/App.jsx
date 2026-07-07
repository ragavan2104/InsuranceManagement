import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Dashboard/Login';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import UserDashboard from './pages/Dashboard/UserDashboard';
import OfficerDashboard from './pages/Dashboard/OfficerDashboard';
import Profile from './pages/Dashboard/Profile';
import ApplyProposal from './pages/Proposals/ApplyProposal';
import FileClaim from './pages/Claims/FileClaim';
import Checkout from './pages/Payments/Checkout';
import Loader from './components/loader';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState({
    userId: localStorage.getItem('userId') || '',
    fullName: localStorage.getItem('fullName') || '',
    email: localStorage.getItem('email') || '',
    roleName: localStorage.getItem('roleName') || ''
  });
  const [appLoading, setAppLoading] = useState(false);

  // Sync token and user profile on mount and storage events
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

  const handleLoginSuccess = (loginData) => {
    setToken(loginData.token);
    setUser({
      userId: loginData.userId,
      fullName: loginData.fullName,
      email: loginData.email,
      roleName: loginData.roleName
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUser({ userId: '', fullName: '', email: '', roleName: '' });
  };

  // Loader state control callbacks
  const startLoading = () => setAppLoading(true);
  const stopLoading = () => setAppLoading(false);

  const getDashboardComponent = () => {
    if (user.roleName === 'Admin') {
      return <AdminDashboard user={user} onLogout={handleLogout} />;
    } else if (user.roleName === 'Officer') {
      return <OfficerDashboard user={user} onLogout={handleLogout} />;
    } else if (user.roleName === 'User') {
      return <UserDashboard user={user} onLogout={handleLogout} />;
    }
    return (
      <div className="empty-state">
        <h3>Access Forbidden</h3>
        <p>Your user profile role is not recognized or lacks security privileges.</p>
        <button className="btn btn-primary" onClick={handleLogout}>Sign Out</button>
      </div>
    );
  };

  return (
    <Router>
      {appLoading && (
        <div className="dashboard-loader-overlay">
          <Loader />
        </div>
      )}
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login 
                onLoginSuccess={handleLoginSuccess} 
                onStartLoading={startLoading} 
                onStopLoading={stopLoading} 
              />
            )
          } 
        />

        {/* Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            token ? (
              getDashboardComponent()
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* User Route: Apply Proposal */}
        <Route 
          path="/apply-proposal" 
          element={
            token && user.roleName === 'User' ? (
              <ApplyProposal />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        {/* User Route: File Claim */}
        <Route 
          path="/file-claim" 
          element={
            token && user.roleName === 'User' ? (
              <FileClaim />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        {/* User Route: Checkout */}
        <Route 
          path="/checkout" 
          element={
            token && user.roleName === 'User' ? (
              <Checkout />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        {/* Global Route: Profile */}
        <Route 
          path="/profile" 
          element={
            token ? (
              <Profile user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Default Redirects */}
        <Route 
          path="/" 
          element={<Navigate to={token ? "/dashboard" : "/login"} replace />} 
        />
        
        {/* Fallback */}
        <Route 
          path="*" 
          element={<Navigate to={token ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
