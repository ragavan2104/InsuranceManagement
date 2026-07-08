import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { getMyProposalHistory } from '../../services/proposalService';
import { getMyClaimsHistory } from '../../services/claimService';
import Loader from '../../components/loader';
import { Layers, Activity, PlusCircle, LogOut, ShieldAlert, User, Menu as MenuIcon } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

import UserStats from '../../components/User/UserStats';
import DuePayments from '../../components/User/DuePayments';
import ActiveCoverages from '../../components/User/ActiveCoverages';
import ProposalsHistory from '../../components/User/ProposalsHistory';
import ClaimsHistory from '../../components/User/ClaimsHistory';


const UserDashboard = ({ user = { fullName: "Valued Customer" }, onLogout }) => {
  const navigate = useNavigate();
  
  const [proposals, setProposals] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggled, setToggled] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dynamic injection of Toastify CSS to guarantee perfect visual presentation
  useEffect(() => {
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [proposalData, claimData] = await Promise.all([
        getMyProposalHistory(),
        getMyClaimsHistory()
      ]);
      setProposals(proposalData || []);
      setClaims(claimData || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve dashboard details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activePolicies = proposals.filter(p => p.status === 'PolicyIssued');
  const pendingProposals = proposals.filter(p => p.status === 'Pending');
  const approvedProposals = proposals.filter(p => p.status === 'Approved');

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      
      {/* Toast Notification Deck */}
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} />

      {}
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
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Sidebar Logo Header */}
            <div className="flex items-center gap-3 px-6 py-8 border-b border-white/5">
              <div className="p-2 bg-[#fcdb32]/10 rounded-xl">
                <Layers className="text-[#fcdb32]" size={22} />
              </div>
              <h2 className="text-md font-black tracking-widest text-white uppercase">
                Auto<span className="text-[#fcdb32]">Insure</span>
              </h2>
            </div>
            
            {/* User Info Card Inside Sidebar */}
            <div className="p-4 mx-4 my-6 bg-white/5 rounded-2xl border border-white/5 shadow-inner flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fcdb32] text-[#141d38] rounded-xl flex items-center justify-center font-black shrink-0 shadow-md">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-extrabold text-white truncate">{user.fullName}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">Policyholder</span>
              </div>
            </div>

            {/* Menu Items list */}
            <Menu className="px-2">
              <MenuItem 
                active={activeTab === 'dashboard'} 
                icon={<Activity size={18} />} 
                onClick={() => { setActiveTab('dashboard'); setToggled(false); }}
                rootStyles={activeTab === 'dashboard' ? {
                  ['.ps-menu-button']: {
                    backgroundColor: 'rgba(252, 219, 50, 0.15) !important',
                    color: '#fcdb32 !important',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                  }
                } : {
                  ['.ps-menu-button']: {
                    borderRadius: '12px',
                  }
                }}
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
                icon={<User size={18} />} 
                onClick={() => navigate('/profile')}
                rootStyles={{ ['.ps-menu-button']: { borderRadius: '12px' } }}
              >
                My Profile
              </MenuItem>
            </Menu>
          </div>

          {/* Logout Section */}
          <div className="p-4 border-t border-white/5">
            <Menu className="px-2">
              <MenuItem 
                icon={<LogOut size={18} className="text-rose-400" />} 
                onClick={onLogout}
                rootStyles={{
                  ['.ps-menu-button']: {
                    borderRadius: '12px',
                    color: '#fda4af !important',
                  },
                  ['.ps-menu-button:hover']: {
                    backgroundColor: 'rgba(244, 63, 94, 0.12) !important',
                    color: '#f43f5e !important',
                  }
                }}
              >
                Sign Out
              </MenuItem>
            </Menu>
          </div>
        </div>
      </Sidebar>

      {}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto relative min-h-screen">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-[100] flex items-center justify-center backdrop-blur-sm transition-all duration-300">
            <Loader />
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2.5 -ml-2 text-slate-600 hover:text-[#141d38] hover:bg-slate-100 rounded-xl transition duration-150 cursor-pointer"
              onClick={() => setToggled(true)}
            >
              <MenuIcon size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#141d38] tracking-tight">
                Welcome back, {user.fullName}
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1.5 font-medium leading-relaxed">
                Manage active vehicle protection covers, track claims settlements, and review submitted policy schedules.
              </p>
            </div>
          </div>
          {activeTab === 'dashboard' && (
            <div className="shrink-0 flex gap-3">
              <button 
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-[#141d38]/5 text-slate-700 font-bold py-3 px-5 rounded-xl transition duration-200 text-xs tracking-wider uppercase cursor-pointer border border-slate-200/60 shadow-sm"
                onClick={() => navigate('/file-claim')}
              >
                <ShieldAlert size={14} />
                <span>File a Claim</span>
              </button>
              <button 
                className="flex items-center gap-1.5 bg-[#141d38] hover:bg-[#141d38]/95 text-[#fcdb32] font-extrabold py-3 px-5 rounded-xl transition duration-200 text-xs tracking-wider uppercase cursor-pointer shadow-md active:scale-[0.98]"
                onClick={() => navigate('/apply-proposal')}
              >
                <PlusCircle size={14} />
                <span>Apply New Policy</span>
              </button>
            </div>
          )}
        </header>

        {}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Status Metrics Cards */}
            <UserStats 
              activeCount={activePolicies.length} 
              pendingCount={pendingProposals.length} 
              claimsCount={claims.length} 
            />

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Due Payments (if any) */}
              <DuePayments approvedProposals={approvedProposals} />

              {/* Active Policies */}
              <ActiveCoverages activePolicies={activePolicies} />

              {/* Proposals History */}
              <ProposalsHistory proposals={proposals} />

              {/* Claims History */}
              <ClaimsHistory claims={claims} />
            </div>
          </div>
      </main>
    </div>
  );
};

export default UserDashboard;