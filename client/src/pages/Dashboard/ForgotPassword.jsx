import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Mail, ArrowLeft, HelpCircle } from 'lucide-react';
import Button from '../../components/Common/Button';
import { toast, ToastContainer } from 'react-toastify';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamically load Toastify CSS via JSDelivr CDN
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

    if (!email) {
      toast.error('Please enter your registered email address.');
      return;
    }

    try {
      setLoading(true);
      const response = await API.post('/Auth/forgot-password', { email });
      toast.success(response.data.message || 'A password recovery token has been emailed to you.');
      setEmail('');
      
      // Delay navigation back to login slightly so they can read the toast!
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.response?.data || 'Failed to trigger password recovery. Verify connection.';
      toast.error(typeof errMsg === 'string' ? errMsg : 'Failed to trigger password recovery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 px-4 py-12 relative overflow-hidden font-sans">
      {/* Universal Toast Notification Layer */}
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} />

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-6 sm:p-10 relative overflow-hidden animate-in fade-in duration-300">
        
        {/* Decorative Top Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#141d38] via-[#fcdb32] to-[#141d38]" />

        {/* Back Link */}
        <button 
          onClick={() => navigate('/login')}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8 mt-6">
          <div className="w-16 h-16 bg-[#141d38] text-[#fcdb32] rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-[#141d38] shadow-md">
            <HelpCircle size={32} className="stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-[#141d38] tracking-tight">Recover Password</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium leading-relaxed">
            Enter your registered email address. We will verify your account records and send you a secure link to choose a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              <span>{loading ? 'Processing...' : 'Send Recovery Link'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
