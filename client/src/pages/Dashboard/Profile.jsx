import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
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
  Smartphone,
  Users,
  FileText,
  Layers,
  Clock,
  ShieldAlert,
  PlusCircle,
  Calendar,
  Menu as MenuIcon
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import API from '../../services/api';
import Loader from '../../components/loader';

const Profile = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [toggled, setToggled] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoadingDetails(true);
        const res = await API.get(`/User/${user.userId}`);
        setUserDetails(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load complete user profile details.');
      } finally {
        setLoadingDetails(false);
      }
    };

    if (user?.userId) {
      fetchUserDetails();
    }
  }, [user]);

  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleCopyText = (text, label) => {
    if (!text) return;
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

  const renderSidebar = () => {
    // ADMIN SIDEBAR
    if (user.roleName === 'Admin') {
      return (
        <Sidebar
          breakPoint="md"
          toggled={toggled}
          onBackdropClick={() => setToggled(false)}
          backgroundColor="#141d38"
          rootStyles={{
            borderColor: 'rgba(255,255,255,0.06)',
            color: '#cbd5e1',
            '& .ps-sidebar-container': {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              paddingBottom: '1.5rem',
              backgroundColor: '#141d38'
            }
          }}
        >
          <div className="flex flex-col flex-1">
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#fcdb32] text-[#141d38] flex items-center justify-center font-black text-sm shadow-md">
                AI
              </div>
              <div>
                <h2 className="text-sm font-black tracking-widest uppercase text-white">Admin Terminal</h2>
                <span className="text-[9px] text-[#fcdb32] font-bold uppercase tracking-wider block mt-0.5">Control Central</span>
              </div>
            </div>

            <div className="m-4 p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3.5 hover:bg-white/10 transition-all duration-200">
              <div className="w-10 h-10 bg-[#fcdb32] text-[#141d38] rounded-xl flex items-center justify-center font-black text-base shadow-inner shrink-0">
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-100 truncate">{user?.fullName || 'System Admin'}</span>
                <span className="text-[9px] text-[#fcdb32] font-extrabold uppercase mt-0.5 tracking-wider">{user?.roleName || 'Administrator'}</span>
              </div>
            </div>

            <Menu
              menuItemStyles={{
                button: ({ active }) => ({
                  backgroundColor: active ? '#fcdb32' : 'transparent',
                  color: active ? '#141d38' : '#cbd5e1',
                  fontWeight: active ? '800' : '600',
                  fontSize: '11px',
                  letterSpacing: '0.025em',
                  borderRadius: '0.75rem',
                  margin: '0.25rem 1rem',
                  padding: '0.5rem 1rem',
                  transition: 'all 200ms ease-out',
                  '&:hover': {
                    backgroundColor: active ? '#fcdb32' : 'rgba(255, 255, 255, 0.05)',
                    color: active ? '#141d38' : '#ffffff',
                  },
                }),
                icon: ({ active }) => ({
                  color: active ? '#141d38' : '#94a3b8',
                })
              }}
            >
              <MenuItem icon={<Users size={16} />} onClick={() => navigate('/admin/users')}>
                Manage Users
              </MenuItem>
              <MenuItem icon={<FileText size={16} />} onClick={() => navigate('/admin/policies')}>
                Manage Policies
              </MenuItem>
              <MenuItem icon={<Layers size={16} />} onClick={() => navigate('/admin/addons')}>
                Manage Add-Ons
              </MenuItem>
              <MenuItem icon={<Clock size={16} />} onClick={() => navigate('/admin/proposals')}>
                Review Proposals
              </MenuItem>
              <MenuItem icon={<ShieldAlert size={16} />} onClick={() => navigate('/admin/claims')}>
                Review Claims
              </MenuItem>
              <MenuItem icon={<Clock size={16} />} onClick={() => navigate('/admin/all-proposals')}>
                Proposals History
              </MenuItem>
              <MenuItem icon={<ShieldAlert size={16} />} onClick={() => navigate('/admin/all-claims')}>
                Claims History
              </MenuItem>

              <MenuItem active={true} icon={<User size={16} />}>
                My Profile
              </MenuItem>
            </Menu>
          </div>

          <div className="px-4 pt-4 border-t border-white/5 mt-auto">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-3 rounded-xl border border-rose-500/10 transition-all duration-200 text-xs tracking-widest uppercase cursor-pointer active:scale-[0.98]"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </Sidebar>
      );
    }

    // OFFICER SIDEBAR
    if (user.roleName === 'Officer') {
      return (
        <Sidebar
          breakPoint="md"
          toggled={toggled}
          onBackdropClick={() => setToggled(false)}
          backgroundColor="#1e293b"
          rootStyles={{
            borderColor: 'rgba(255,255,255,0.06)',
            color: '#cbd5e1',
            '& .ps-sidebar-container': {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              paddingBottom: '1.5rem',
              backgroundColor: '#1e293b'
            }
          }}
        >
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-3 mb-8 px-6 py-8 border-b border-white/5">
              <Layers className="text-blue-500" size={24} />
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">Officer Panel</h2>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-800/40 rounded-xl mb-8 mx-4 border border-slate-800/50">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shrink-0">
                {user?.fullName?.charAt(0).toUpperCase() || 'O'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-slate-200 truncate">{user.fullName}</span>
                <span className="text-xs text-slate-400 mt-0.5">{user.roleName}</span>
              </div>
            </div>

            <Menu
              menuItemStyles={{
                button: ({ active }) => ({
                  color: active ? '#3b82f6' : '#cbd5e1',
                  fontWeight: active ? '700' : '500',
                  fontSize: '13px',
                  backgroundColor: active ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.08)',
                    color: '#3b82f6'
                  }
                }),
                icon: ({ active }) => ({
                  color: active ? '#3b82f6' : '#94a3b8'
                })
              }}
            >
              <MenuItem icon={<Clock size={18} />} onClick={() => navigate('/officer/proposals')}>
                Proposals Queue
              </MenuItem>
              <MenuItem icon={<ShieldAlert size={18} />} onClick={() => navigate('/officer/claims')}>
                Claims Queue
              </MenuItem>
              <MenuItem icon={<Clock size={18} />} onClick={() => navigate('/officer/all-proposals')}>
                Proposals History
              </MenuItem>
              <MenuItem icon={<ShieldAlert size={18} />} onClick={() => navigate('/officer/all-claims')}>
                Claims History
              </MenuItem>
              <MenuItem icon={<Shield size={18} />} onClick={() => navigate('/officer/policies')}>
                Manage Policies
              </MenuItem>

              <MenuItem active={true} icon={<User size={18} />}>
                My Profile
              </MenuItem>
            </Menu>
          </div>

          <div className="px-4 pt-4 border-t border-white/5 mt-auto">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-3 rounded-xl border border-rose-500/10 transition-all duration-200 text-xs tracking-widest uppercase cursor-pointer active:scale-[0.98]"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </Sidebar>
      );
    }

    // USER SIDEBAR
    return (
      <Sidebar
        breakPoint="md"
        toggled={toggled}
        onBackdropClick={() => setToggled(false)}
        backgroundColor="#141d38"
        rootStyles={{
          ['.ps-sidebar-container']: {
            backgroundColor: '#141d38',
            color: '#cbd5e1',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
          },
          ['.ps-menu-button:hover']: {
            backgroundColor: 'rgba(252, 219, 50, 0.08) !important',
            color: '#fcdb32 !important',
          },
          ['.ps-menu-button']: {
            transition: 'all 200ms ease-in-out',
          }
        }}
      >
        <div className="flex flex-col h-full justify-between pb-6">
          <div>
            <div className="flex items-center gap-3 px-6 py-8 border-b border-white/5">
              <div className="p-2 bg-[#fcdb32]/10 rounded-xl">
                <Layers className="text-[#fcdb32]" size={22} />
              </div>
              <h2 className="text-md font-black tracking-widest text-white uppercase">
                Auto<span className="text-[#fcdb32]">Insure</span>
              </h2>
            </div>

            <div className="p-4 mx-4 my-6 bg-white/5 rounded-2xl border border-white/5 shadow-inner flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fcdb32] text-[#141d38] rounded-xl flex items-center justify-center font-black shrink-0 shadow-md">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-extrabold text-white truncate">{user.fullName}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">Policyholder</span>
              </div>
            </div>

            <Menu className="px-2">
              <MenuItem
                icon={<Activity size={18} />}
                onClick={() => navigate('/dashboard')}
                rootStyles={{ ['.ps-menu-button']: { borderRadius: '12px' } }}
              >
                My Dashboard
              </MenuItem>

              <div className="my-3 border-t border-white/5 mx-3" />

              <MenuItem
                icon={<PlusCircle size={18} />}
                onClick={() => navigate('/apply-proposal')}
                rootStyles={{ ['.ps-menu-button']: { borderRadius: '12px' } }}
              >
                Apply For Policy
              </MenuItem>

              <MenuItem
                icon={<ShieldAlert size={18} />}
                onClick={() => navigate('/file-claim')}
                rootStyles={{ ['.ps-menu-button']: { borderRadius: '12px' } }}
              >
                File a Claim
              </MenuItem>

              <MenuItem
                active={true}
                icon={<User size={18} />}
                rootStyles={{
                  ['.ps-menu-button']: {
                    backgroundColor: 'rgba(252, 219, 50, 0.15) !important',
                    color: '#fcdb32 !important',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                  }
                }}
              >
                My Profile
              </MenuItem>
            </Menu>
          </div>

          <div className="px-4 pt-4 border-t border-white/5 mx-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 bg-[#fcdb32]/10 hover:bg-[#fcdb32]/20 text-[#fcdb32] font-bold py-3.5 rounded-xl border border-[#fcdb32]/10 transition-all duration-200 text-xs tracking-widest uppercase cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </Sidebar>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans relative overflow-hidden">

      {/* Toast Notification Deck */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {loadingDetails && (
        <div className="fixed inset-0 bg-white/80 z-[120] flex items-center justify-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      {renderSidebar()}

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Responsive Workspace Header */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-[#141d38] hover:bg-slate-50 rounded-xl transition cursor-pointer"
              onClick={() => setToggled(true)}
            >
              <MenuIcon size={20} />
            </button>
            <div>
              <h1 className="text-base font-black text-[#141d38] uppercase tracking-wider">Account Credentials Profile</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                Manage your verification documents, contact address, and authorization scope
              </span>
            </div>
          </div>
        </header>

        {/* Profile Card Layout */}
        <div className="p-6 md:p-8 max-w-5xl w-full mx-auto animate-in fade-in duration-300">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left Column - Dynamic Avatar & Role summary card */}
            <div className="lg:col-span-1 bg-[#141d38] text-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center relative overflow-hidden group transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#fcdb32]" />
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-24 h-24 bg-white/5 rounded-full blur-md" />

              <div className="relative mb-4 mt-2">
                <div className="absolute inset-0 bg-[#fcdb32]/20 rounded-full scale-105" />
                <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center font-black text-[#141d38] text-3xl shadow-lg border-4 border-[#141d38]">
                  {getInitials(userDetails?.fullName)}
                </div>
              </div>

              <h3 className="font-extrabold text-lg text-white tracking-tight leading-tight">
                {userDetails?.fullName || 'User Profile'}
              </h3>

              <span className="mt-2.5 bg-[#fcdb32]/10 text-[#fcdb32] text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-[#fcdb32]/25 uppercase tracking-widest">
                {user?.roleName || 'Policyholder'}
              </span>

              <div className="w-full border-t border-white/10 mt-6 pt-5 flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle size={14} className="stroke-[2.5]" />
                  <span>Account Verified</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-300 text-xs font-semibold">
                  <Activity size={14} className="animate-pulse text-[#fcdb32]" />
                  <span>Security Session Active</span>
                </div>
              </div>
            </div>

            {/* Right Column - Full Personal Details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Credentials Details Card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-[#141d38] text-xs uppercase tracking-widest flex items-center gap-2.5">
                    <User size={16} className="text-[#fcdb32] stroke-[2.5]" />
                    <span>Personal Credentials Details</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100/50 flex justify-between items-center group cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleCopyText(userDetails?.userId, "User ID")}
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">User Account ID</span>
                      <div className="text-xs font-bold text-[#141d38] mt-1">#{userDetails?.userId || 'N/A'}</div>
                    </div>
                    <Clipboard size={14} className="text-slate-300 group-hover:text-[#141d38] transition-colors" />
                  </div>

                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100/50">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Full Registered Name</span>
                    <div className="text-xs font-bold text-slate-800 mt-1">{userDetails?.fullName || 'N/A'}</div>
                  </div>

                  <div
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100/50 flex justify-between items-center group cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleCopyText(userDetails?.email, "Email Address")}
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Email Address</span>
                      <div className="text-xs font-bold text-[#141d38] mt-1 flex items-center gap-1.5">
                        <Mail size={13} className="text-slate-400" />
                        <span>{userDetails?.email || 'N/A'}</span>
                      </div>
                    </div>
                    <Clipboard size={14} className="text-slate-300 group-hover:text-[#141d38] transition-colors" />
                  </div>

                  <div
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100/50 flex justify-between items-center group cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleCopyText(userDetails?.phone, "Phone Number")}
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Mobile Number</span>
                      <div className="text-xs font-bold text-[#141d38] mt-1 flex items-center gap-1.5">
                        <Smartphone size={13} className="text-slate-400" />
                        <span>{userDetails?.phone || 'N/A'}</span>
                      </div>
                    </div>
                    <Clipboard size={14} className="text-slate-300 group-hover:text-[#141d38] transition-colors" />
                  </div>
                </div>
              </div>

              {/* Verification & Address Card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-[#141d38] text-xs uppercase tracking-widest flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-[#fcdb32] stroke-[2.5]" />
                    <span>Identity Documents & Location</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100/50 flex justify-between items-center group cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleCopyText(userDetails?.aadhaarNumber, "Aadhaar Card Number")}
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Aadhaar Card Number</span>
                      <div className="text-xs font-bold text-[#141d38] mt-1">
                        {userDetails?.aadhaarNumber ? userDetails.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim() : 'N/A'}
                      </div>
                    </div>
                    <Clipboard size={14} className="text-slate-300 group-hover:text-[#141d38] transition-colors" />
                  </div>

                  <div
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100/50 flex justify-between items-center group cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleCopyText(userDetails?.panNumber, "PAN Card Number")}
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">PAN Card Number</span>
                      <div className="text-xs font-bold text-[#141d38] mt-1 font-mono tracking-wider">{userDetails?.panNumber || 'N/A'}</div>
                    </div>
                    <Clipboard size={14} className="text-slate-300 group-hover:text-[#141d38] transition-colors" />
                  </div>

                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100/50">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Date of Birth</span>
                    <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>
                        {userDetails?.dateOfBirth
                          ? new Date(userDetails.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100/50">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Age Calculation</span>
                    <div className="text-xs font-bold text-slate-800 mt-1">{userDetails?.age ? `${userDetails.age} Years` : 'N/A'}</div>
                  </div>

                  <div
                    className="sm:col-span-2 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100/50 flex justify-between items-center group cursor-pointer hover:bg-slate-100 transition"
                    onClick={() => handleCopyText(userDetails?.address, "Home Address")}
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Permanent Address</span>
                      <div className="text-xs font-medium text-slate-800 mt-1.5 leading-relaxed">{userDetails?.address || 'N/A'}</div>
                    </div>
                    <Clipboard size={14} className="text-slate-300 group-hover:text-[#141d38] transition-colors shrink-0 self-start mt-1" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;