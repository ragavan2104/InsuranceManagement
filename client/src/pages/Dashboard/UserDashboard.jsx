import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { getMyProposalHistory } from '../../services/proposalService';
import { getMyClaimsHistory } from '../../services/claimService';
import Loader from '../../components/loader';
import { Layers, Activity, PlusCircle, LogOut, ShieldAlert, User, Menu as MenuIcon } from 'lucide-react';

import UserStats from '../../components/User/UserStats';
import DuePayments from '../../components/User/DuePayments';
import ActiveCoverages from '../../components/User/ActiveCoverages';
import ProposalsHistory from '../../components/User/ProposalsHistory';
import ClaimsHistory from '../../components/User/ClaimsHistory';

const UserDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggled, setToggled] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [proposalData, claimData] = await Promise.all([
        getMyProposalHistory(),
        getMyClaimsHistory()
      ]);
      setProposals(proposalData);
      setClaims(claimData);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve dashboard details. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const activePolicies = proposals.filter(p => p.status === 'PolicyIssued');
  const pendingProposals = proposals.filter(p => p.status === 'Pending');
  const approvedProposals = proposals.filter(p => p.status === 'Approved');

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
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">Auto Insurance</h2>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-slate-800/40 rounded-xl mb-8 mx-4 border border-slate-800/50">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-slate-200 truncate">{user.fullName}</span>
            <span className="text-xs text-slate-400 mt-0.5">Policyholder</span>
          </div>
        </div>

        <Menu>
          <MenuItem 
            active={true} 
            icon={<Activity size={18} />} 
          >
            My Dashboard
          </MenuItem>
          
          <MenuItem 
            icon={<PlusCircle size={18} />} 
            onClick={() => navigate('/apply-proposal')}
          >
            Apply For Policy
          </MenuItem>

          <MenuItem 
            icon={<ShieldAlert size={18} />} 
            onClick={() => navigate('/file-claim')}
          >
            File a Claim
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
      <main className="flex-1 p-8 md:p-10 overflow-y-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-[100] flex items-center justify-center">
            <Loader />
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition duration-150 cursor-pointer"
              onClick={() => setToggled(true)}
            >
              <MenuIcon size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-950">Welcome back, {user.fullName}</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your vehicle coverages, track claims, and apply for protection</p>
            </div>
          </div>
          <div className="shrink-0 flex gap-3">
            <button 
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-5 rounded-xl transition duration-200 text-sm cursor-pointer"
              onClick={() => navigate('/file-claim')}
            >
              <ShieldAlert size={16} />
              <span>File a Claim</span>
            </button>
            <button 
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition duration-200 text-sm cursor-pointer"
              onClick={() => navigate('/apply-proposal')}
            >
              <PlusCircle size={16} />
              <span>Apply New Policy</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 mb-6 text-sm font-medium">
            <span>{error}</span>
          </div>
        )}

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
      </main>
    </div>
  );
};

export default UserDashboard;
