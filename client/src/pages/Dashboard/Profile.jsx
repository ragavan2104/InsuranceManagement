import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Shield, 
  Key, 
  CheckCircle, 
  Activity,
  LogOut,
  Clipboard,
  ShieldCheck,
  Lock,
  Smartphone
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const Profile = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // Safely inject Toastify CSS dynamically via CDN link to avoid bundler compile blocks inside Canvas
  useEffect(() => {
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
  }, []);

  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleCopyText = (text, label) => {
    try {
      const tempInput = document.createElement('input');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy details.");
    }
  };

  const handleSignOut = () => {
    toast.info("Signing out of your secure session...", { autoClose: 1500 });
    setTimeout(() => {
      if (onLogout) onLogout();
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 relative font-sans">
      
      {/* Toast Notification Deck */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <div className="max-w-3xl mx-auto">
        
        {/* Navigation header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-8 gap-3">
          <button 
            className="flex items-center gap-2 text-slate-500 hover:text-[#141d38] text-sm font-bold transition-all duration-200 self-start group" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Go Back</span>
          </button>
          <h2 className="text-lg font-black text-[#141d38] tracking-tight uppercase flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#fcdb32]" />
            User Account Profile
          </h2>
        </header>

        {/* Profile Card Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Panel - Dynamic Avatar & Role Summary Card */}
          <div className="md:col-span-1 bg-[#141d38] text-white rounded-2xl shadow-xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-2xl hover:shadow-[#141d38]/15 hover:-translate-y-1 transition-all duration-300">
            {/* Top Yellow Accented Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#fcdb32]" />
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-24 h-24 bg-white/5 rounded-full blur-md" />

            {/* Pulsing Avatar Frame */}
            <div className="relative mb-4 mt-2">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#fcdb32] to-[#141d38] rounded-full animate-spin-slow opacity-80 group-hover:scale-105 transition-transform duration-300" />
              <div className="relative w-24 h-24 bg-white rounded-full m-1 flex items-center justify-center font-black text-[#141d38] text-3xl shadow-lg ring-4 ring-[#141d38]">
                {getInitials(user?.fullName)}
              </div>
            </div>

            <h3 className="font-extrabold text-lg text-white tracking-tight leading-tight group-hover:text-[#fcdb32] transition-colors duration-200">
              {user?.fullName || 'User Account'}
            </h3>
            
            <span className="mt-2.5 bg-[#fcdb32] text-[#141d38] text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-[#fcdb32] uppercase tracking-widest">
              {user?.roleName || 'Policyholder'}
            </span>

            {/* Verified & Active Markers */}
            <div className="w-full border-t border-white/10 mt-6 pt-5 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle size={14} className="stroke-[2.5]" />
                <span>Account Verified</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300 text-xs font-semibold">
                <Activity size={14} className="animate-pulse text-[#fcdb32]" />
                <span>Secure Session Active</span>
              </div>
            </div>

            {/* Logout Action Button */}
            <button 
              onClick={handleSignOut}
              className="mt-8 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 font-bold py-3 px-4 rounded-xl border border-white/10 hover:border-rose-500/20 transition-all duration-200 text-xs cursor-pointer active:scale-[0.98]"
            >
              <LogOut size={14} />
              <span>Sign Out Profile</span>
            </button>
          </div>

          {/* Right Panel - Interactive Account Details */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Personal Details Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 hover:shadow-md transition-all duration-300">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-[#141d38] text-xs uppercase tracking-widest flex items-center gap-2.5">
                  <User size={16} className="text-[#fcdb32] stroke-[2.5]" />
                  <span>Personal Credentials</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Account ID Block */}
                <div 
                  className="p-3 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100 flex justify-between items-center group cursor-pointer transition"
                  onClick={() => handleCopyText(user?.userId, "Account ID")}
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Account ID</span>
                    <div className="text-xs font-bold text-[#141d38] mt-1">#{user?.userId || 'N/A'}</div>
                  </div>
                  <Clipboard size={14} className="text-slate-300 group-hover:text-[#141d38] transition-colors" />
                </div>

                {/* Full Name Block */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Full Name</span>
                  <div className="text-xs font-bold text-slate-800 mt-1">{user?.fullName || 'N/A'}</div>
                </div>

                {/* Email Address Block */}
                <div 
                  className="sm:col-span-2 p-4 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-100 flex justify-between items-center group cursor-pointer transition"
                  onClick={() => handleCopyText(user?.email, "Email Address")}
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Email Address</span>
                    <div className="text-xs font-bold text-[#141d38] mt-1.5 flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span>{user?.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold text-[#fcdb32] bg-[#141d38] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">COPY</span>
                    <Clipboard size={14} className="text-slate-300 group-hover:text-[#141d38] transition-colors" />
                  </div>
                </div>

              </div>
            </div>

            {/* Privacy, Authorization & JWT Credentials Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 hover:shadow-md transition-all duration-300">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-[#141d38] text-xs uppercase tracking-widest flex items-center gap-2.5">
                  <Shield size={16} className="text-[#fcdb32] stroke-[2.5]" />
                  <span>Security & Authorized Scope</span>
                </h4>
              </div>

              <div className="space-y-4">
                
                {/* Authorization Token Block */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#141d38]/10 transition duration-200">
                  <div className="p-2 bg-[#141d38]/5 rounded-lg text-[#141d38]">
                    <Lock size={18} className="stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#141d38]">Session Credentials</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-medium leading-relaxed">
                      Your identity and policy updates are securely guarded via encrypted storage tokens (JWT).
                    </span>
                  </div>
                </div>

                {/* Access Level Scope block */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#141d38]/10 transition duration-200">
                  <div className="p-2 bg-[#141d38]/5 rounded-lg text-[#141d38]">
                    <Shield size={18} className="stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#141d38]">Access Permissions</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-medium leading-relaxed">
                      Authorized specifically for {user?.roleName === 'Admin' ? 'administrative system panels' : user?.roleName === 'Officer' ? 'underwriting proposal audits' : 'applying policies, filing claims, and calculations'}.
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;