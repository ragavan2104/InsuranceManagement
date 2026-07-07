import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Shield, 
  Key, 
  CheckCircle, 
  Activity,
  LogOut
} from 'lucide-react';

const Profile = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Navigation header */}
        <header className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
          <button 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition duration-150 cursor-pointer" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          <h2 className="text-xl font-bold text-slate-800 font-sans">User Account Profile</h2>
        </header>

        {/* Profile Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Panel - Avatar & Role summary */}
          <div className="md:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 ease-out">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-3xl shadow-lg mb-4 ring-4 ring-blue-50">
              {getInitials(user?.fullName)}
            </div>
            <h3 className="font-bold text-lg text-slate-800 tracking-tight leading-tight">{user?.fullName || 'User Account'}</h3>
            <span className="mt-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-100/50">
              {user?.roleName || 'Policyholder'}
            </span>

            <div className="w-full border-t border-slate-50 mt-6 pt-5 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 text-xs font-medium">
                <CheckCircle size={14} />
                <span>Account Verified</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-medium">
                <Activity size={14} />
                <span>Session Active</span>
              </div>
            </div>

            <button 
              onClick={() => {
                onLogout();
                navigate('/login');
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100/70 text-rose-600 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-xs cursor-pointer active:scale-[0.98]"
            >
              <LogOut size={14} />
              <span>Sign Out Profile</span>
            </button>
          </div>

          {/* Right Panel - Account Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Details */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 hover:shadow-md transition-all duration-300 ease-out">
              <div className="border-b border-slate-50 pb-3">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  <span>Personal Details</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account ID</span>
                  <div className="text-sm font-semibold text-slate-700 mt-1 select-all">#{user?.userId || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</span>
                  <div className="text-sm font-semibold text-slate-800 mt-1">{user?.fullName || 'N/A'}</div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                  <div className="text-sm font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Mail size={14} className="text-slate-400" />
                    <span>{user?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Credentials */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 hover:shadow-md transition-all duration-300 ease-out">
              <div className="border-b border-slate-50 pb-3">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Shield size={16} className="text-slate-400" />
                  <span>Security & Roles</span>
                </h4>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3.5 p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <Key size={18} className="text-slate-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Account Credentials</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Authentication managed via secure JWT storage tokens</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                  <Shield size={18} className="text-slate-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">Access Privileges</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Authorized for {user?.roleName === 'Admin' ? 'administrative controls' : user?.roleName === 'Officer' ? 'underwriting auditing' : 'policy applications & claims filing'}</span>
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
