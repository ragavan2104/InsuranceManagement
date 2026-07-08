import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import API from '../../services/api';
import Button from '../../components/Common/Button';
import Loader from '../../components/loader';

const Login = ({ onLoginSuccess, onStartLoading, onStopLoading }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamically load Toastify CSS via JSDelivr CDN on element mounting to prevent Canvas compiling errors
  useEffect(() => {
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      if (typeof onStartLoading === 'function') onStartLoading();
      
      const response = await API.post('/auth/login', { email, password });
      const { token, userId, fullName, roleName } = response.data;
      
      // Store credentials in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('roleName', roleName);
      localStorage.setItem('userId', userId);
      localStorage.setItem('fullName', fullName);
      localStorage.setItem('email', email);
      
      toast.success(`Welcome back, ${fullName}! Directing to your dashboard...`);
      
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess({ token, userId, fullName, roleName, email });
      }
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          toast.error(data);
        } else if (data.errors) {
          toast.error(Object.values(data.errors).flat().join(', '));
        } else {
          toast.error(data.message || data.title || 'Invalid credentials. Please verify details.');
        }
      } else {
        toast.error('Connection to server failed. Please check if backend is running.');
      }
    } finally {
      setLoading(false);
      if (typeof onStopLoading === 'function') onStopLoading();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Universal Toast Notification Layer */}
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} />

      {/* Centered Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center backdrop-blur-sm transition-all duration-300">
          <Loader />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-6 sm:p-10 relative overflow-hidden animate-in fade-in duration-300">
        
        {/* Decorative Top Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#141d38] via-[#fcdb32] to-[#141d38]" />

        {/* Brand logo (Shield + Vehicle Integration) */}
        <div className="text-center mb-8 mt-4">
        
          <h2 className="text-2xl font-black text-[#141d38] tracking-tight">AutoInsure</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Vehicle Insurance Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="email"
                id="email"
                placeholder="username@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <button 
                type="button"
                onClick={() => {
                  navigate('/forgot-password');
                }}
                className="text-[10px] font-black text-[#141d38] hover:text-[#141d38]/80 hover:underline cursor-pointer transition-all duration-150"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full"
            >
              <span className="flex items-center justify-center gap-2">
                <LogIn size={14} className="stroke-[2.5]" />
                <span>Sign In</span>
              </span>
            </Button>
          </div>
            
          <p className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100 font-medium">
            Don't have a coverage account?{' '}
            <span 
              onClick={() => navigate('/register')} 
              className="text-[#141d38] font-black hover:text-[#141d38]/80 hover:underline cursor-pointer transition-all duration-150"
            >
              Sign Up Here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;