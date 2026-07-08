import React, { useState, useEffect } from 'react';
import { FileText, Clipboard, Eye, X, Calendar, Car, Shield, Activity, FileCheck, Info } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const ProposalsHistory = ({ proposals = [] }) => {
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Safely inject Toastify CSS dynamically via CDN link to avoid compile blocks inside Canvas
  useEffect(() => {
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
  }, []);

  const handleCopyId = (proposalId, e) => {
    e.stopPropagation();
    try {
      const tempInput = document.createElement('input');
      tempInput.value = `#${proposalId}`;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      toast.success(`Reference ID #${proposalId} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy Reference ID.");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': 
        return 'bg-amber-50 text-amber-700 border-amber-200/80 animate-pulse';
      case 'Approved': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'Rejected': 
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'PolicyIssued': 
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      default: 
        return 'bg-slate-50 text-slate-600 border-slate-200/80';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all duration-300 relative overflow-hidden">
      
      {/* Toast Notification Layer */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-6 bg-[#fcdb32] rounded-full"></div>
          <div>
            <h3 className="text-base font-bold text-[#141d38]">Proposal Applications History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Review, copy, or audit your submitted policy application forms.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#141d38]/5 text-[#141d38] text-xs font-bold px-3 py-1.5 rounded-lg">
          <Activity size={14} className="text-[#141d38]" />
          <span>{proposals.length} Applications</span>
        </div>
      </div>

      {/* Main Table / View Area */}
      {proposals.length === 0 ? (
        <div className="text-center py-16 text-slate-400 space-y-4">
          <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300">
            <FileText size={36} className="stroke-1" />
          </div>
          <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">No proposal applications have been submitted yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-3 rounded-l-lg">Reference ID</th>
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-3">Policy Name</th>
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-3 py-3">Vehicle Details</th>
                <th className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-right px-3 py-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map(p => (
                <tr 
                  key={p.proposalId} 
                  className="group hover:bg-slate-50/50 transition-colors duration-150 border-b border-slate-100/60 cursor-pointer"
                  onClick={() => setSelectedProposal(p)}
                >
                  <td className="px-3 py-4 text-sm text-slate-600 align-middle">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[#141d38] group-hover:text-black">#{p.proposalId}</span>
                      <button 
                        onClick={(e) => handleCopyId(p.proposalId, e)}
                        className="text-slate-400 hover:text-[#141d38] p-1 rounded transition-colors"
                        title="Copy ID"
                      >
                        <Clipboard size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-600 align-middle">
                    <span className="text-[#141d38] font-bold block">{p.insurancePolicy?.policyName || 'Standard Policy'}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Type: {p.insurancePolicy?.policyType || 'Third Party'}</span>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-600 align-middle">
                    <span className="text-slate-700 font-semibold block">{p.vehicleMake} {p.vehicleModel}</span>
                    <span className="font-mono text-xs text-slate-400 block mt-0.5">{p.vehicleNumber || 'Pending Reg'}</span>
                  </td>
                  <td className="px-3 py-4 text-sm align-middle text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(p.status)}`}>
                        {p.status}
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

      {/* Details Inspector Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-[#141d38]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border mb-1.5 ${getStatusBadgeClass(selectedProposal.status)}`}>
                  Status: {selectedProposal.status}
                </span>
                <h4 className="text-base font-bold text-[#141d38]">Application Audit Details</h4>
                <p className="text-xs text-slate-400 mt-0.5">Reference: #{selectedProposal.proposalId}</p>
              </div>
              <button 
                onClick={() => setSelectedProposal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition duration-150 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              
              {/* Policy parameters card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <FileCheck size={12} className="text-[#fcdb32]" />
                  <span>Proposed Coverage Plan</span>
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-500">Plan Name:</span>
                  <span className="font-bold text-[#141d38]">{selectedProposal.insurancePolicy?.policyName || 'Standard Policy'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Base Premium Rate:</span>
                  <span className="font-semibold text-slate-700">₹{selectedProposal.insurancePolicy?.basePremium || 'N/A'}</span>
                </div>
              </div>

              {/* Vehicle specs card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <Car size={12} className="text-[#fcdb32]" />
                  <span>Vehicle Information</span>
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-slate-500">Make & Model:</span>
                  <span className="font-semibold text-slate-800">{selectedProposal.vehicleMake} {selectedProposal.vehicleModel}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Registration ID:</span>
                  <span className="font-mono font-bold text-[#141d38]">{selectedProposal.vehicleNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Year of Manufacture:</span>
                  <span className="font-semibold text-slate-700">{selectedProposal.vehicleYear || 'N/A'}</span>
                </div>
              </div>

              {/* Remarks/Timeline notification */}
              {selectedProposal.officerRemarks && (
                <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl text-xs space-y-1">
                  <span className="font-extrabold text-amber-800 uppercase text-[9px] tracking-wider block">Underwriter Decision Remarks</span>
                  <p className="text-amber-900 leading-relaxed">{selectedProposal.officerRemarks}</p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-4 mt-5 flex justify-end">
              <button 
                onClick={() => setSelectedProposal(null)}
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

export default ProposalsHistory;