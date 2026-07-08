import React, { useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Shield, 
  LogOut, 
  Layers,
  Clock,
  ShieldAlert,
  User,
  Menu as MenuIcon,
  Activity
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

import ManageUsersTab from '../../components/Admin/ManageUsersTab';
import ManagePoliciesTab from '../../components/Admin/ManagePoliciesTab';
import ManageAddOnsTab from '../../components/Admin/ManageAddOnsTab';
import ReviewProposalsTab from '../../components/Admin/ReviewProposalsTab';
import ReviewClaimsTab from '../../components/Admin/ReviewClaimsTab';
import AllProposalsHistoryTab from '../../components/Admin/AllProposalsHistoryTab';
import AllClaimsHistoryTab from '../../components/Admin/AllClaimsHistoryTab';
import Loader from '../../components/loader';

const AdminDashboard = ({ user = { fullName: "System Admin", roleName: "Admin" }, onLogout }) => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [toggled, setToggled] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const activeTab = tab || 'users';

  useEffect(() => {
    // Dynamic styling patch to prevent offline esbuild pipeline lockups
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
  }, []);

  const handleTabChange = (tabId, label) => {
    navigate(`/admin/${tabId}`);
    setToggled(false);
    toast.success(`Active Tab set to: ${label}`);
  };

  const handleLogoutAction = () => {
    toast.info("Safely terminating security session...", { autoClose: 1200 });
    setTimeout(() => {
      if (onLogout) onLogout();
    }, 1200);
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans relative overflow-hidden">
      
      {/* Dynamic Security Toast layer */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Primary loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[120] flex items-center justify-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      {}
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
            paddingBottom: '1.5rem'
          }
        }}
      >
        <div className="flex flex-col flex-1">
          {/* Main system branding header */}
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#fcdb32] text-[#141d38] flex items-center justify-center font-black text-sm shadow-md">
              AI
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest uppercase text-white">Admin Terminal</h2>
              <span className="text-[9px] text-[#fcdb32] font-bold uppercase tracking-wider block mt-0.5">Control Central</span>
            </div>
          </div>
          
          {/* Active Administrator Identity Widget */}
          <div className="m-4 p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3.5 hover:bg-white/10 transition-all duration-200">
            <div className="w-10 h-10 bg-[#fcdb32] text-[#141d38] rounded-xl flex items-center justify-center font-black text-base shadow-inner shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-100 truncate">{user?.fullName || 'System Admin'}</span>
              <span className="text-[9px] text-[#fcdb32] font-extrabold uppercase mt-0.5 tracking-wider">{user?.roleName || 'Administrator'}</span>
            </div>
          </div>

          {}
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
            <MenuItem 
              active={activeTab === 'users'} 
              icon={<Users size={16} />} 
              onClick={() => handleTabChange('users', 'Users Account Directory')}
            >
              Manage Users
            </MenuItem>
            
            <MenuItem 
              active={activeTab === 'policies'} 
              icon={<FileText size={16} />} 
              onClick={() => handleTabChange('policies', 'Insurance Policies Management')}
            >
              Manage Policies
            </MenuItem>

            <MenuItem 
              active={activeTab === 'addons'} 
              icon={<Layers size={16} />} 
              onClick={() => handleTabChange('addons', 'Protective Add-Ons')}
            >
              Manage Add-Ons
            </MenuItem>

            <MenuItem 
              active={activeTab === 'proposals'} 
              icon={<Clock size={16} />} 
              onClick={() => handleTabChange('proposals', 'Pending Underwriting Proposals')}
            >
              Review Proposals
            </MenuItem>

            <MenuItem 
              active={activeTab === 'claims'} 
              icon={<ShieldAlert size={16} />} 
              onClick={() => handleTabChange('claims', 'Claims Evaluation Queue')}
            >
              Review Claims
            </MenuItem>

            <MenuItem 
              active={activeTab === 'all-proposals'} 
              icon={<Clock size={16} />} 
              onClick={() => handleTabChange('all-proposals', 'Proposals Catalog History')}
            >
              Proposals History
            </MenuItem>

            <MenuItem 
              active={activeTab === 'all-claims'} 
              icon={<ShieldAlert size={16} />} 
              onClick={() => handleTabChange('all-claims', 'Claims Settlement History')}
            >
              Claims History
            </MenuItem>

            <MenuItem 
              icon={<User size={16} />} 
              onClick={() => {
                toast.info("Navigating to secure profile panel...");
                navigate('/profile');
              }}
            >
              My Profile
            </MenuItem>
          </Menu>
        </div>

        {}
        <div className="px-4 pt-4 border-t border-white/5 mt-auto">
          <button 
            onClick={handleLogoutAction}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-3 rounded-xl border border-rose-500/10 transition-all duration-200 text-xs tracking-widest uppercase cursor-pointer active:scale-[0.98]"
          >
            <LogOut size={14} />
            <span>Sign Out </span>
          </button>
        </div>
      </Sidebar>

      {}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Modern styled workspace header */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-[#141d38] hover:bg-slate-50 rounded-xl transition cursor-pointer"
              onClick={() => setToggled(true)}
            >
              <MenuIcon size={20} />
            </button>
            <div>
              <h1 className="text-base font-black text-[#141d38] uppercase tracking-wider">
                {activeTab === 'users' && 'Users Account Directory'}
                {activeTab === 'policies' && 'Insurance Policies Management'}
                {activeTab === 'addons' && 'Protective Extensions Addons'}
                {activeTab === 'proposals' && 'Pending Application Queue'}
                {activeTab === 'claims' && 'Underwriting Settlements Desk'}
                {activeTab === 'all-proposals' && 'Proposals History Catalog'}
                {activeTab === 'all-claims' && 'Claims Settlement History'}
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                {activeTab === 'users' && 'Manage authorizations, statuses, and credentials verification'}
                {activeTab === 'policies' && 'Configure custom pricing models and legal parameters structures'}
                {activeTab === 'addons' && 'Modify standard additions liabilities covers programs'}
                {activeTab === 'proposals' && 'Authorize coverage eligibility, values, and calculated premiums'}
                {activeTab === 'claims' && 'Audit claimed physical damage and approve paid settlements'}
                {activeTab === 'all-proposals' && 'Explore all user-submitted vehicle coverage applications'}
                {activeTab === 'all-claims' && 'Track historical claim events, incidents, and total settled losses'}
              </span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3">
            <span className="bg-[#141d38]/5 text-[#141d38] font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5">
              <Activity size={12} className="animate-pulse text-emerald-500" />
              Secure Link Active
            </span>
          </div>
        </header>

        {}
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {activeTab === 'users' && <ManageUsersTab />}
          {activeTab === 'policies' && <ManagePoliciesTab />}
          {activeTab === 'addons' && <ManageAddOnsTab />}
          {activeTab === 'proposals' && <ReviewProposalsTab />}
          {activeTab === 'claims' && <ReviewClaimsTab />}
          {activeTab === 'all-proposals' && <AllProposalsHistoryTab />}
          {activeTab === 'all-claims' && <AllClaimsHistoryTab />}
        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;