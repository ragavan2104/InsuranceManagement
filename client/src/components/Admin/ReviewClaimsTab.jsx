import React, { useState, useEffect } from 'react';
import { Eye, Info, Check, ShieldAlert, FileText, Calendar, IndianRupee } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

// ============================================================================
// ⚠️ LOCAL PROJECT INSTRUCTIONS ⚠️
// To stop the online preview from crashing, I had to temporarily comment out 
// your local imports. When you copy this to your IDE, UNCOMMENT these lines 
// and DELETE the tiny temporary mock variables below!
// ============================================================================
import Loader from '../loader';
import { getPendingClaimsQueue, reviewClaim } from '../../services/claimService';

const ReviewClaimsTab = () => {
  const [loading, setLoading] = useState(false);

  const [pendingClaims, setPendingClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimReviewData, setClaimReviewData] = useState({
    status: 'Approved',
    approvedSettlementAmount: '',
    officerRemarks: ''
  });

  useEffect(() => {
    // Dynamically loading Toastify CSS so the online preview doesn't crash.
    // (You can remove this if you uncomment the CSS import at the top locally).
    if (!document.getElementById('toastify-css')) {
      const link = document.createElement('link');
      link.id = 'toastify-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify/dist/ReactToastify.min.css';
      document.head.appendChild(link);
    }
    
    fetchQueueData();
  }, []);

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const data = await getPendingClaimsQueue();
      setPendingClaims(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch pending claims queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;

    try {
      setLoading(true);
      
      const payload = {
        status: claimReviewData.status,
        approvedSettlementAmount: claimReviewData.status === 'Approved' 
          ? parseFloat(claimReviewData.approvedSettlementAmount) 
          : 0,
        officerRemarks: claimReviewData.officerRemarks
      };

      await reviewClaim(selectedClaim.claimId, payload);
      
      toast.success(`Claim ID #${selectedClaim.claimId} has been successfully marked as ${claimReviewData.status}.`);
      setSelectedClaim(null);
      setClaimReviewData({ status: 'Approved', approvedSettlementAmount: '', officerRemarks: '' });
      fetchQueueData();
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          toast.error(data);
        } else if (data.errors) {
          toast.error(Object.values(data.errors).flat().join(', '));
        } else {
          toast.error(data.message || data.title || 'Failed to submit claim review.');
        }
      } else {
        toast.error('Failed to submit claim review.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 min-h-screen p-8 bg-bigstone/[0.02]">
      <ToastContainer position="top-right" />

      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-bigstone/10 pb-5 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-bigstone">Claims Audit & Settlement</h2>
          <p className="text-sm text-bigstone/60 mt-1">Review incident reports, evaluate damages, and process settlements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-300">
        
        {/* Left Side: Claims Queue Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-bigstone/10 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden flex flex-col h-fit">
          <div className="p-6 border-b border-bigstone/5 bg-bigstone/[0.02] flex items-center justify-between">
            <h3 className="text-lg font-bold text-bigstone">Claims Settlement Queue</h3>
            <span className="bg-bigstone/10 text-bigstone text-xs font-bold px-3 py-1 rounded-full">
              {pendingClaims.length} Pending
            </span>
          </div>
          
          {pendingClaims.length === 0 ? (
            <div className="text-center py-16 px-4 bg-bigstone/[0.01]">
              <div className="bg-white p-4 rounded-full shadow-sm w-fit mx-auto mb-4 border border-bigstone/5">
                <ShieldAlert size={32} className="text-bigstone/30" />
              </div>
              <p className="text-base font-bold text-bigstone/70">All clear!</p>
              <p className="text-sm text-bigstone/50 mt-1">There are no outstanding claims awaiting auditing.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-bigstone/10">
                    <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-4 pt-2">ID</th>
                    <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-4 pt-2">Policy Num</th>
                    <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-4 pt-2">Incident</th>
                    <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-4 pt-2">Estimated Loss</th>
                    <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-4 pt-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bigstone/5">
                  {pendingClaims.map(c => {
                    const isSelected = selectedClaim?.claimId === c.claimId;
                    return (
                      <tr 
                        key={c.claimId} 
                        className={`hover:bg-brightsun/10 transition-colors duration-200 group cursor-pointer ${isSelected ? 'bg-brightsun/10 shadow-inner' : ''}`}
                        onClick={() => setSelectedClaim(c)}
                      >
                        <td className="py-4 px-4 text-sm text-bigstone/80 align-middle">
                          <span className={`font-bold transition-colors ${isSelected ? 'text-bigstone' : 'group-hover:text-bigstone'}`}>#{c.claimId}</span>
                        </td>
                        <td className="py-4 px-4 text-sm text-bigstone align-middle">
                          <strong className="font-bold">{c.policyNumber}</strong>
                        </td>
                        <td className="py-4 px-4 text-sm text-bigstone/70 align-middle max-w-[200px]">
                          <span className="font-medium block truncate" title={c.incidentDescription}>{c.incidentDescription}</span>
                        </td>
                        <td className="py-4 px-4 text-sm text-bigstone align-middle">
                          <span className="bg-bigstone/5 px-2.5 py-1 rounded-md font-bold text-bigstone/90">
                            ₹{parseFloat(c.estimatedLossAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm align-middle text-right">
                          <button 
                            className={`inline-flex items-center gap-1.5 font-bold py-1.5 px-3 rounded-lg text-xs transition-all duration-200 border shadow-sm
                              ${isSelected 
                                ? 'bg-bigstone text-brightsun border-bigstone' 
                                : 'bg-bigstone/5 hover:bg-brightsun text-bigstone hover:border-brightsun/50 border-transparent'}`}
                            onClick={(e) => { e.stopPropagation(); setSelectedClaim(c); }}
                          >
                            <Eye size={14} />
                            <span>Evaluate</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Claims review evaluation block */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-bigstone/10 shadow-sm p-6 h-fit sticky top-8 transition-all duration-300">
          {selectedClaim ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-b border-bigstone/10 pb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-bigstone">Evaluate Claim <span className="text-bigstone/50 ml-1">#{selectedClaim.claimId}</span></h3>
              </div>

              <div className="space-y-5">
                {/* Incident Details Card */}
                <div className="bg-bigstone/5 rounded-xl p-5 border border-bigstone/5 space-y-4">
                  <h4 className="text-xs font-bold text-bigstone/50 uppercase tracking-wider border-b border-bigstone/10 pb-2 mb-3">Claim Incident Details</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FileText size={16} className="text-bigstone/40 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-bigstone/50 uppercase tracking-wider">Policy Details</span>
                        <span className="text-sm font-bold text-bigstone">{selectedClaim.policyNumber}</span>
                        <span className="text-xs font-semibold text-bigstone/70 mt-0.5">{selectedClaim.policyName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-bigstone/40 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-bigstone/50 uppercase tracking-wider">Incident Date</span>
                        <span className="text-sm font-bold text-bigstone">{new Date(selectedClaim.incidentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <IndianRupee size={16} className="text-bigstone/40 mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-bigstone/50 uppercase tracking-wider">Estimated Loss</span>
                        <span className="text-sm font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md mt-1 w-fit">
                          ₹{parseFloat(selectedClaim.estimatedLossAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-bigstone/5 rounded-xl p-5 border border-bigstone/5 space-y-2.5">
                  <h4 className="text-xs font-bold text-bigstone/50 uppercase tracking-wider mb-2">Description of Damage</h4>
                  <p className="text-sm text-bigstone/80 leading-relaxed font-medium bg-white/60 p-3 rounded-lg border border-bigstone/5">
                    {selectedClaim.incidentDescription}
                  </p>
                </div>
              </div>

              {/* Claim Review Form */}
              <form onSubmit={handleClaimReviewSubmit} className="border-t border-bigstone/10 pt-5 space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Auditing Status</label>
                  <select 
                    value={claimReviewData.status}
                    onChange={e => setClaimReviewData({...claimReviewData, status: e.target.value})}
                    className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm font-semibold"
                  >
                    <option value="Approved">Approve Settlement</option>
                    <option value="Rejected">Reject Claim</option>
                  </select>
                </div>

                {claimReviewData.status === 'Approved' && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider flex justify-between">
                      Approved Settlement Amount (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <IndianRupee size={16} className="text-bigstone/40" />
                      </div>
                      <input 
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        max={selectedClaim.estimatedLossAmount}
                        placeholder={`${selectedClaim.estimatedLossAmount}`}
                        value={claimReviewData.approvedSettlementAmount}
                        onChange={e => setClaimReviewData({...claimReviewData, approvedSettlementAmount: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 font-bold"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-bigstone/50 bg-bigstone/5 px-2 py-1 rounded-md mt-1 border border-bigstone/5">
                      Max Liability: <strong className="text-bigstone/70">₹{parseFloat(selectedClaim.estimatedLossAmount || 0).toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Auditing Notes / Remarks</label>
                  <textarea 
                    required
                    rows="3"
                    maxLength="500"
                    placeholder="Provide details explaining the approval amount or rejection cause..."
                    value={claimReviewData.officerRemarks}
                    onChange={e => setClaimReviewData({...claimReviewData, officerRemarks: e.target.value})}
                    className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl transition duration-200 text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer
                    ${claimReviewData.status === 'Approved' 
                      ? 'bg-bigstone hover:bg-bigstone/90 text-brightsun' 
                      : 'bg-rose-600 hover:bg-rose-700 text-white'}`}
                >
                  <Check size={18} />
                  <span>Submit Claim Audit</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-bigstone/[0.02] rounded-xl border border-dashed border-bigstone/10 h-full flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-bigstone/5">
                <Info size={32} className="text-bigstone/30" />
              </div>
              <h4 className="text-base font-bold text-bigstone/80 mb-2">No Claim Selected</h4>
              <p className="text-sm text-bigstone/60 font-medium max-w-[250px] mx-auto leading-relaxed">
                Select a claim from the settlement queue to audit incidents, evaluate values, and approve settlements.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewClaimsTab;