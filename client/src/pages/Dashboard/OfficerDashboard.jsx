import React, { useState } from 'react';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { Layers, Clock, ShieldAlert, LogOut, User, Menu as MenuIcon, Shield } from 'lucide-react';
import ReviewProposalsTab from '../../components/Admin/ReviewProposalsTab';
import ReviewClaimsTab from '../../components/Admin/ReviewClaimsTab';
import AllProposalsHistoryTab from '../../components/Admin/AllProposalsHistoryTab';
import AllClaimsHistoryTab from '../../components/Admin/AllClaimsHistoryTab';
import ManagePoliciesTab from '../../components/Admin/ManagePoliciesTab';

const OfficerDashboard = ({ user, onLogout }) => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [toggled, setToggled] = useState(false);

  const activeTab = tab || 'proposals';

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar navigation using react-pro-sidebar */}
      <Sidebar 
        breakPoint="md" 
        toggled={toggled} 
        onBackdropClick={() => setToggled(false)}
      >
        <div className="flex items-center gap-3 mb-8 px-4 py-2">
          <Layers className="text-blue-500" size={24} />
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">Officer Panel</h2>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-slate-800/40 rounded-xl mb-8 mx-4 border border-slate-800/50">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-slate-200 truncate">{user.fullName}</span>
            <span className="text-xs text-slate-400 mt-0.5">{user.roleName}</span>
          </div>
        </div>

        <Menu>
          <MenuItem 
            active={activeTab === 'proposals'} 
            icon={<Clock size={18} />} 
            onClick={() => { navigate('/officer/proposals'); setToggled(false); }}
          >
            Proposals Queue
          </MenuItem>
          
          <MenuItem 
            active={activeTab === 'claims'} 
            icon={<ShieldAlert size={18} />} 
            onClick={() => { navigate('/officer/claims'); setToggled(false); }}
          >
            Claims Queue
          </MenuItem>
 
          <MenuItem 
            active={activeTab === 'all-proposals'} 
            icon={<Clock size={18} />} 
            onClick={() => { navigate('/officer/all-proposals'); setToggled(false); }}
          >
            Proposals History
          </MenuItem>
 
          <MenuItem 
            active={activeTab === 'all-claims'} 
            icon={<ShieldAlert size={18} />} 
            onClick={() => { navigate('/officer/all-claims'); setToggled(false); }}
          >
            Claims History
          </MenuItem>
 
          <MenuItem 
            active={activeTab === 'policies'} 
            icon={<Shield size={18} />} 
            onClick={() => { navigate('/officer/policies'); setToggled(false); }}
          >
            Manage Policies
          </MenuItem>
 


          <MenuItem 
            icon={<User size={18} />} 
            onClick={() => navigate('/profile')}
          >
            My Profile
          </MenuItem>

          <MenuItem 
            icon={<LogOut size={18} />} 
            onClick={onLogout}
            style={{ marginTop: 'auto' }}
          >
            Sign Out
          </MenuItem>
        </Menu>
      </Sidebar>

      {/* Main dashboard content */}
      <main className="flex-1 p-8 md:p-10 overflow-y-auto">
        <header className="flex items-center gap-3 border-b border-slate-200 pb-5 mb-8">
          <button 
            className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition duration-150 cursor-pointer"
            onClick={() => setToggled(true)}
          >
            <MenuIcon size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {activeTab === 'proposals' && 'Pending Underwriting Proposals'}
            {activeTab === 'claims' && 'Claims Evaluation Queue'}
            {activeTab === 'all-proposals' && 'Proposals History Catalog'}
            {activeTab === 'all-claims' && 'Claims Settlement History'}
            {activeTab === 'policies' && 'Insurance Policies & Coverages'}
          </h1>
        </header>

        {/* Tab content rendering */}
        {activeTab === 'proposals' && <ReviewProposalsTab />}
        {activeTab === 'claims' && <ReviewClaimsTab />}
        {activeTab === 'all-proposals' && <AllProposalsHistoryTab />}
        {activeTab === 'all-claims' && <AllClaimsHistoryTab />}
        {activeTab === 'policies' && <ManagePoliciesTab />}
      </main>
    </div>
  );
};

export default OfficerDashboard;
