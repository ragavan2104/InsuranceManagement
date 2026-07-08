import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Eye, X, Calendar, Car, FileCheck, DollarSign, Activity, RefreshCw, Slash, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

import API from '../../services/api';
import Loader from '../../components/loader';

// --- INLINE DESIGN SYSTEM TOKENS ---
const colors = {
  brightsun: '#fcdb32',
  bigstone: '#141d38'
};

const ActiveCoverages = () => {
  const navigate = useNavigate();
  const [selectedCoverage, setSelectedCoverage] = useState(null);
  const [issuedPolicies, setIssuedPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Custom confirmation modal states (compliant with iframe sandboxing)
  const [confirmAction, setConfirmAction] = useState(null); // 'cancel' | 'renew' | null

  // Safely inject Toastify CSS dynamically via CDN link to avoid esbuild compile blocks
  useEffect(() => {
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
    fetchMyIssuedPolicies();
  }, []);

  const fetchMyIssuedPolicies = async () => {
    try {
      setLoading(true);
      const response = await API.get('/IssuedPolicy/my');
      setIssuedPolicies(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 404) {
        toast.error('Failed to fetch active coverages.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPolicy = async (id) => {
    try {
      setLoading(true);
      await API.post(`/IssuedPolicy/cancel/${id}`);
      toast.success('Policy cancelled successfully.');
      setSelectedCoverage(null);
      setConfirmAction(null);
      fetchMyIssuedPolicies();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel the policy.');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewPolicy = (coverage) => {
    if (!coverage) return;
    setConfirmAction(null);
    setSelectedCoverage(null);
    
    // Extract parameters
    const pId = coverage.proposalId || coverage.proposal?.proposalId;
    const premium = coverage.proposal?.totalCalculatedPremium || coverage.proposal?.quote?.totalPremium || coverage.insurancePolicy?.basePremium || 0;
    const pName = coverage.insurancePolicy?.policyName || 'Insurance Policy';

    toast.info('Redirecting to checkout for premium payment...');
    navigate('/checkout', {
      state: {
        proposalId: pId,
        amount: premium,
        policyName: pName,
        isRenewal: true,
        issuedPolicyId: coverage.issuedPolicyId
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all duration-300 relative overflow-hidden">
      
      {/* Toast notifications container */}
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} />

      {loading && (
        <div className="absolute inset-0 bg-white/80 z-[100] flex items-center justify-center rounded-2xl backdrop-blur-sm transition-all duration-300">
          <Loader />
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-6 bg-[#fcdb32] rounded-full"></div>
          <div>
            <h3 className="text-base font-bold text-[#141d38]">My Active Coverages</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage details, renewals, claims, and active policy parameters.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#141d38]/5 text-[#141d38] text-xs font-bold px-3 py-1.5 rounded-lg">
          <Activity size={14} className="animate-pulse text-[#141d38]" />
          <span>{issuedPolicies.filter(p => p.status === 'Active').length} Active</span>
        </div>
      </div>

      {/* Main Table / View Area */}
      {issuedPolicies.length === 0 ? (
        <div className="text-center py-14 text-slate-400 space-y-4">
          <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300">
            <FileCheck size={36} className="stroke-1" />
          </div>
          <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">You do not have any active insurance policies or coverage plans currently.</p>
          <button 
            className="bg-[#141d38] hover:bg-[#141d38]/90 active:scale-[0.97] text-[#fcdb32] text-xs font-bold py-2.5 px-5 rounded-xl transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-2 mx-auto"
            onClick={() => navigate('/apply-proposal')}
          >
            <span>Browse Policies</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-3 rounded-l-lg">Policy Plan</th>
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-3">Vehicle Details</th>
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-3">Status</th>
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-right px-3 py-3 rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {issuedPolicies.map(p => {
                const vehicleName = p.proposal ? `${p.proposal.vehicleMake} ${p.proposal.vehicleModel}` : 'N/A';
                const vehicleNumber = p.proposal?.vehicleNumber || 'N/A';
                
                return (
                  <tr key={p.issuedPolicyId} className="group hover:bg-slate-50/50 transition-colors duration-150 border-b border-slate-100/60">
                    <td className="px-3 py-4 text-sm text-slate-600 align-middle">
                      <strong className="text-[#141d38] font-bold block group-hover:text-black transition-colors duration-150">
                        {p.insurancePolicy?.policyName || 'Standard Policy'}
                      </strong>
                      <span className="font-mono text-xs text-slate-400 mt-0.5 block">{p.policyNumber}</span>
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-600 align-middle">
                      <span className="text-slate-700 font-semibold block">{vehicleName}</span>
                      <span className="font-mono text-xs text-slate-400 mt-0.5 block">{vehicleNumber}</span>
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-600 align-middle">
                      <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-slate-600 align-middle text-right">
                      <button
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-[#fcdb32] hover:text-[#141d38] text-slate-700 text-xs font-bold py-2 px-3.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow active:scale-[0.96]"
                        onClick={() => setSelectedCoverage(p)}
                        title="View Policy Details"
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Policy Details Overlay Modal with Inline Confirmation */}
      {selectedCoverage && (
        <div className="fixed inset-0 bg-[#141d38]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border mb-1.5 ${getStatusBadge(selectedCoverage.status)}`}>
                  {selectedCoverage.status} Coverage
                </span>
                <h4 className="text-lg font-bold text-[#141d38]">{selectedCoverage.insurancePolicy?.policyName || 'Standard Policy'}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Policy: {selectedCoverage.policyNumber}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedCoverage(null);
                  setConfirmAction(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition duration-150 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Custom Interactive Safe Confirm Panel */}
            {confirmAction ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
                <div className={`p-4 rounded-full ${confirmAction === 'cancel' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {confirmAction === 'cancel' ? <Slash size={32} /> : <RefreshCw size={32} className="animate-spin-slow animate-spin" />}
                </div>
                
                <div className="max-w-md space-y-2">
                  <h5 className="text-base font-bold text-[#141d38]">
                    {confirmAction === 'cancel' ? 'Confirm Policy Cancellation' : 'Confirm Policy Renewal'}
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {confirmAction === 'cancel' 
                      ? 'Are you sure you want to cancel this policy? This action is permanent and your coverage will end immediately.' 
                      : 'Would you like to extend this policy coverage? The renewal will extend your coverage duration securely.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full pt-4 max-w-xs">
                  <button
                    className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    onClick={() => setConfirmAction(null)}
                  >
                    Go Back
                  </button>
                  {confirmAction === 'cancel' ? (
                    <button
                      className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm"
                      onClick={() => handleCancelPolicy(selectedCoverage.issuedPolicyId)}
                    >
                      Yes, Cancel
                    </button>
                  ) : (
                    <button
                      className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
                      onClick={() => handleRenewPolicy(selectedCoverage)}
                    >
                      Yes, Renew
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Core Content Body */
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                
                {/* Reference ID Block */}
                <div className="bg-[#141d38]/5 rounded-xl p-4 border border-slate-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="text-[#141d38]" size={18} />
                    <span className="text-xs text-[#141d38] font-bold">Policy Registration ID</span>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
                    {selectedCoverage.issuedPolicyId}
                  </span>
                </div>

                {/* Grid Details Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Vehicle Details Card */}
                  <div className="border border-slate-100 rounded-xl p-4 space-y-2 hover:shadow-sm transition-shadow duration-200 bg-slate-50/50">
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <Car size={12} className="text-slate-400" />
                      <span>Vehicle Info</span>
                    </span>
                    <div>
                      <span className="text-xs text-slate-800 font-bold block">
                        {selectedCoverage.proposal?.vehicleMake || 'N/A'} {selectedCoverage.proposal?.vehicleModel || 'N/A'}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 block mt-1">Reg: {selectedCoverage.proposal?.vehicleNumber || 'N/A'}</span>
                      <span className="text-[10px] text-slate-500 block">Year of Mfg: {selectedCoverage.proposal?.vehicleYear || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Term Details Card */}
                  <div className="border border-slate-100 rounded-xl p-4 space-y-2 hover:shadow-sm transition-shadow duration-200 bg-slate-50/50">
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <Calendar size={12} className="text-slate-400" />
                      <span>Coverage Period</span>
                    </span>
                    <div>
                      <span className="text-xs text-slate-800 font-bold block">
                        {selectedCoverage.insurancePolicy?.policyDurationMonths || 12} Months Term
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 block mt-1">Start: {new Date(selectedCoverage.startDate).toLocaleDateString()}</span>
                      <span className="font-mono text-[10px] text-slate-500 block">End: {new Date(selectedCoverage.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                </div>

                {/* Premium Breakdown Section */}
                <div className="space-y-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
                    <DollarSign size={12} className="text-slate-400" />
                    <span>Financial Overview</span>
                  </span>
                  
                  <div className="border border-slate-100 rounded-xl p-4 space-y-2.5 bg-slate-50/20">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold">Insured Declared Value (IDV)</span>
                      <span className="font-bold text-[#141d38]">₹{selectedCoverage.proposal?.finalInsuredDeclaredValue || selectedCoverage.insurancePolicy?.coverageAmount || 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-500 font-semibold">Base Premium Rate</span>
                      <span className="font-bold text-slate-700">₹{selectedCoverage.insurancePolicy?.basePremium || 0}</span>
                    </div>

                    <div className="pt-1 flex justify-between items-center">
                      <span className="text-xs font-bold text-[#141d38]">Total Premium Accounted</span>
                      <span className="text-sm font-extrabold text-emerald-600">₹{selectedCoverage.proposal?.totalCalculatedPremium || selectedCoverage.proposal?.quote?.totalPremium || selectedCoverage.insurancePolicy?.basePremium || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Warning message if policy status is inactive */}
                {selectedCoverage.status !== 'Active' && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs font-semibold flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>This coverage is currently inactive. Actions such as renewing, cancelling, or filing a claim are disabled.</span>
                  </div>
                )}

              </div>
            )}

            {/* Modal Footer Controls */}
            {!confirmAction && (
              <div className="border-t border-slate-100 pt-4 mt-6 flex flex-wrap justify-end gap-2 shrink-0">
                <button 
                  onClick={() => setSelectedCoverage(null)}
                  className="bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-600 font-semibold py-2 px-4 rounded-xl transition duration-150 text-xs cursor-pointer border border-slate-100"
                >
                  Close
                </button>
                
                {selectedCoverage.status === 'Active' && (
                  <>
                    <button 
                      className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl transition duration-150 text-xs cursor-pointer shadow-sm inline-flex items-center gap-1.5"
                      onClick={() => setConfirmAction('renew')}
                    >
                      <RefreshCw size={12} />
                      <span>Renew</span>
                    </button>
                    <button 
                      className="bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl transition duration-150 text-xs cursor-pointer shadow-sm inline-flex items-center gap-1.5"
                      onClick={() => setConfirmAction('cancel')}
                    >
                      <Slash size={12} />
                      <span>Cancel</span>
                    </button>
                    <button 
                      className="bg-[#141d38] hover:bg-[#141d38]/90 active:scale-[0.98] text-[#fcdb32] font-bold py-2.5 px-4 rounded-xl transition duration-150 text-xs cursor-pointer shadow-sm inline-flex items-center gap-1.5"
                      onClick={() => {
                        const vehicleInfo = selectedCoverage.proposal ? `${selectedCoverage.proposal.vehicleMake} ${selectedCoverage.proposal.vehicleModel} (${selectedCoverage.proposal.vehicleNumber})` : 'N/A';
                        setSelectedCoverage(null);
                        navigate('/file-claim', { 
                          state: {
                            issuedPolicyId: selectedCoverage.issuedPolicyId, 
                            policyName: selectedCoverage.insurancePolicy?.policyName || 'Standard Policy',
                            vehicleInfo: vehicleInfo,
                            coverageAmount: selectedCoverage.proposal?.finalInsuredDeclaredValue || selectedCoverage.insurancePolicy?.coverageAmount
                          }
                        });
                      }}
                    >
                      <ShieldAlert size={12} />
                      <span>File a Claim</span>
                    </button>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default ActiveCoverages;