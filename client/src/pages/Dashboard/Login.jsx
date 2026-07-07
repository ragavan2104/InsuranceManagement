import React, { useState } from 'react';
import API from '../../services/api';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = ({ onLoginSuccess, onStartLoading, onStopLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      onStartLoading();
      const response = await API.post('/auth/login', { email, password });
      
      const { token, userId, fullName, roleName } = response.data;
      
      // Store credentials in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('roleName', roleName);
      localStorage.setItem('userId', userId);
      localStorage.setItem('fullName', fullName);
      localStorage.setItem('email', email);
      
      onLoginSuccess({ token, userId, fullName, roleName, email });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(typeof err.response.data === 'string' ? err.response.data : 'Invalid credentials.');
      } else {
        setError('Connection to backend failed. Please try again.');
      }
    } finally {
      onStopLoading();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Vehicle Insurance Portal</h2>
          <p className="text-sm text-slate-500">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 text-sm font-medium">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="email"
                id="email"
                placeholder="you@insurance.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 text-sm"
          >
            <span>Sign In</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
