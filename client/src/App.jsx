import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Dashboard/Login';
import Register from './pages/Dashboard/Register';
import ForgotPassword from './pages/Dashboard/ForgotPassword';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import UserDashboard from './pages/Dashboard/UserDashboard';
import OfficerDashboard from './pages/Dashboard/OfficerDashboard';
import Profile from './pages/Dashboard/Profile';
import ApplyProposal from './pages/Proposals/ApplyProposal';
import FileClaim from './pages/Claims/FileClaim';
import Checkout from './pages/Payments/Checkout';
import NotFound from './pages/NotFound';
import Loader from './components/loader';
import { useAuth } from './contexts/AuthContext.jsx';
import './App.css';

function App() {
  const { token, user, appLoading, login, logout, startLoading, stopLoading } = useAuth();

  const getDashboardComponent = () => {
    if (user.roleName === 'Admin') {
      return <Navigate to="/admin/users" replace />;
    } else if (user.roleName === 'Officer') {
      return <Navigate to="/officer/proposals" replace />;
    } else if (user.roleName === 'User') {
      return <UserDashboard user={user} onLogout={logout} />;
    }
    return (
      <div className="empty-state">
        <h3>Access Forbidden</h3>
        <p>Your user profile role is not recognized or lacks security privileges.</p>
        <button className="btn btn-primary" onClick={logout}>Sign Out</button>
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
                onLoginSuccess={login} 
                onStartLoading={startLoading} 
                onStopLoading={stopLoading} 
              />
            )
          } 
        />

        {/* Register Route */}
        <Route 
          path="/register" 
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register 
                onStartLoading={startLoading} 
                onStopLoading={stopLoading} 
              />
            )
          } 
        />

        {/* Forgot Password Route */}
        <Route 
          path="/forgot-password" 
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ForgotPassword />
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

        {/* Admin Dashboard Routes */}
        <Route 
          path="/admin" 
          element={
            token && user.roleName === 'Admin' ? (
              <Navigate to="/admin/users" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/admin/:tab" 
          element={
            token && user.roleName === 'Admin' ? (
              <AdminDashboard user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Officer Dashboard Routes */}
        <Route 
          path="/officer" 
          element={
            token && user.roleName === 'Officer' ? (
              <Navigate to="/officer/proposals" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/officer/:tab" 
          element={
            token && user.roleName === 'Officer' ? (
              <OfficerDashboard user={user} onLogout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Direct Addon Shortcut Routes */}
        <Route 
          path="/addon" 
          element={
            token && user.roleName === 'Admin' ? (
              <Navigate to="/admin/addons" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/addons" 
          element={
            token && user.roleName === 'Admin' ? (
              <Navigate to="/admin/addons" replace />
            ) : (
              <Navigate to="/dashboard" replace />
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
              <Profile user={user} onLogout={logout} />
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
        
        {/* 404 – Page Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
