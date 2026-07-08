import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Shield, Calendar, DollarSign, Activity, FileText, AlertTriangle, Clipboard } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const ClaimsHistory = ({ claims = [] }) => {
  const [selectedClaim, setSelectedClaim] = useState(null);

  // Safely inject Toastify CSS dynamically via CDN link to avoid compile blocks
  useEffect(() => {
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
  }, []);

  const handleCopyClaimId = (claimId, e) => {
    e.stopPropagation();
    try {
      // Secure fallback clipboard copy helper for iframe containment environment
      const tempInput = document.createElement('input');
      tempInput.value = `#${claimId}`;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      toast.success(`Claim reference #${claimId} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy Claim ID.");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ClaimFiled': 
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'UnderEvaluation': 
        return 'bg-sky-50 text-sky-700 border-sky-200/80 animate-pulse';
      case 'Approved': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'Rejected': 
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default: 
        return 'bg-slate-50 text-slate-600 border-slate-200/80';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all duration-300 relative overflow-hidden">
      
      {/* Toast Notification Layer */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Card Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-6 bg-[#fcdb32] rounded-full"></div>
          <div>
            <h3 className="text-base font-bold text-[#141d38]">Claims Settlements Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track filed cases, verified losses, and payouts.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#141d38]/5 text-[#141d38] text-xs font-bold px-3 py-1.5 rounded-lg">
          <Activity size={14} className="text-[#141d38]" />
          <span>{claims.length} Cases Filed</span>
        </div>
      </div>

      {/* Case List Content */}
      {claims.length === 0 ? (
        <div className="text-center py-16 text-slate-400 space-y-4">
          <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300">
            <Shield size={36} className="stroke-1" />
          </div>
          <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">No insurance claims have been registered or filed yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-3 rounded-l-lg">Claim ID</th>
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-3">Incident Description</th>
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-3">Loss Amount</th>
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-3">Settled Amount</th>
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-right px-3 py-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {claims.map(c => (
                <tr 
                  key={c.claimId} 
                  className="group hover:bg-slate-50/50 transition-colors duration-150 border-b border-slate-100/60 cursor-pointer"
                  onClick={() => setSelectedClaim(c)}
                >
                  <td className="px-3 py-4 text-sm text-slate-600 align-middle">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[#141d38] group-hover:text-black">#{c.claimId}</span>
                      <button 
                        onClick={(e) => handleCopyClaimId(c.claimId, e)}
                        className="text-slate-400 hover:text-[#141d38] p-1 rounded transition-colors"
                        title="Copy Reference"
                      >
                        <Clipboard size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-600 align-middle max-w-xs">
                    <span className="text-[#141d38] font-bold block truncate" title={c.incidentDescription}>
                      {c.incidentDescription}
                    </span>
                    <span className="font-mono text-xs text-slate-400 mt-0.5 block">
                      Incident Date: {new Date(c.incidentDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-700 font-bold align-middle">
                    ₹{c.estimatedLossAmount}
                  </td>
                  <td className="px-3 py-4 text-sm text-emerald-600 font-extrabold align-middle">
                    ₹{c.approvedSettlementAmount || 0}
                  </td>
                  <td className="px-3 py-4 text-sm align-middle text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(c.status)}`}>
                        {c.status}
                      </span>
                      <button className="text-slate-300 group-hover:text-[#141d38] transition-colors p-1">
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Claim Detail Inspect Overlay Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-[#141d38]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border mb-1.5 ${getStatusBadgeClass(selectedClaim.status)}`}>
                  Status: {selectedClaim.status}
                </span>
                <h4 className="text-base font-bold text-[#141d38]">Claim Audit Details</h4>
                <p className="text-xs text-slate-400 mt-0.5">Reference Identifier: #{selectedClaim.claimId}</p>
              </div>
              <button 
                onClick={() => setSelectedClaim(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition duration-150 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              
              {/* Incident Summary description */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <FileText size={12} className="text-slate-400" />
                  <span>Incident Log Description</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedClaim.incidentDescription}
                </p>
              </div>

              {/* Loss Metrics Card details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/40">
                  <span className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <DollarSign size={10} />
                    <span>Estimated Loss</span>
                  </span>
                  <span className="text-sm font-extrabold text-slate-800 block mt-1">
                    ₹{selectedClaim.estimatedLossAmount}
                  </span>
                </div>
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/40">
                  <span className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <Check size={10} className="text-emerald-500" />
                    <span>Settled Amount</span>
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600 block mt-1">
                    ₹{selectedClaim.approvedSettlementAmount || 0}
                  </span>
                </div>
              </div>

              {/* Dates Period Details Card */}
              <div className="border border-slate-100 rounded-xl p-4 space-y-2 bg-slate-50/20">
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <Calendar size={12} className="text-slate-400" />
                  <span>Log Parameters</span>
                </span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Incident Reported Date:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {new Date(selectedClaim.incidentDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="border-t border-slate-100 pt-4 mt-5 flex justify-end">
              <button 
                onClick={() => setSelectedClaim(null)}
                className="bg-[#141d38] hover:bg-[#141d38]/90 text-[#fcdb32] font-extrabold py-2 px-5 rounded-xl transition duration-150 text-xs shadow-sm hover:shadow active:scale-[0.98]"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ClaimsHistory;