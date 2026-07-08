import React, { useState, useEffect } from 'react';
import Loader from '../loader';
import { Eye, Info, Check, ShieldAlert, Award, FileText, Truck } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { getPendingProposals, reviewProposal } from '../../services/proposalService';
import Button from '../Common/Button';

const ReviewProposalsTab = () => {
  const [loading, setLoading] = useState(false);
  const [pendingProposals, setPendingProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [proposalReviewData, setProposalReviewData] = useState({
    status: 'Approved',
    officerRemarks: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchQueueData();
  }, []);

  const totalItems = pendingProposals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProposals = pendingProposals.slice(startIndex, endIndex);

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const data = await getPendingProposals();
      setPendingProposals(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch pending proposals queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProposal) return;
    
    try {
      setLoading(true);
      await reviewProposal(selectedProposal.proposalId, {
        status: proposalReviewData.status,
        officerRemarks: proposalReviewData.officerRemarks
      });
      
      toast.success(`Proposal ID #${selectedProposal.proposalId} has been successfully marked as ${proposalReviewData.status}.`);
      setSelectedProposal(null);
      setProposalReviewData({ status: 'Approved', officerRemarks: '' });
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
          toast.error(data.message || data.title || 'Failed to submit proposal review.');
        }
      } else {
        toast.error('Failed to submit proposal review.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      {/* Absolute Loader using current loader */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center backdrop-blur-sm transition-all duration-300">
          <Loader />
        </div>
      )}

      {/* Main Panel Header Banner */}
      <div className="bg-[#141d38] text-white rounded-2xl p-6 shadow-md border-l-8 border-[#fcdb32] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Underwriting Review Suite</h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xl">
              Audit pending policy proposal forms, review coverage parameters, and submit your underwriting decision below.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-[#fcdb32] text-[#141d38] font-bold text-xs uppercase px-3 py-1.5 rounded-full tracking-wider shadow-sm flex items-center gap-1.5">
              <ShieldAlert size={14} />
              Auditor Deck
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Underwriting Review Queue Block */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between min-h-[400px]">
          <div>
            <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#fcdb32] animate-pulse"></div>
                <h3 className="text-base font-bold text-[#141d38]">Review Queue List</h3>
              </div>
              <span className="bg-[#141d38]/5 text-[#141d38] text-xs font-bold px-3 py-1 rounded-full">
                {pendingProposals.length} Pending
              </span>
            </div>

            {pendingProposals.length === 0 ? (
              <div className="text-center py-20 text-slate-400 space-y-3">
                <div className="inline-flex p-3 bg-slate-50 text-[#141d38]/30 rounded-full">
                  <Award size={40} className="stroke-1" />
                </div>
                <p className="text-sm font-medium text-slate-500">All clear! No pending proposal applications in the queue.</p>
                <p className="text-xs text-slate-400">Excellent! Your underwriting assignments are fully resolved.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-[#141d38]/5 rounded-lg">
                      <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3 rounded-l-lg">ID</th>
                      <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">User ID</th>
                      <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">Policy Name</th>
                      <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">Vehicle</th>
                      <th className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right px-3 py-3 rounded-r-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProposals.map(p => (
                      <tr 
                        key={p.proposalId} 
                        className={`hover:bg-slate-50/70 transition-all duration-200 border-b border-slate-100/60 ${selectedProposal?.proposalId === p.proposalId ? 'bg-[#fcdb32]/10 hover:bg-[#fcdb32]/15' : ''}`}
                      >
                        <td className="px-3 py-4 text-sm text-slate-600 align-middle">
                          <span className="font-bold text-[#141d38]">#{p.proposalId}</span>
                        </td>
                        <td className="px-3 py-4 text-sm text-slate-500 align-middle font-medium">
                          User #{p.userId}
                        </td>
                        <td className="px-3 py-4 text-sm text-slate-600 align-middle">
                          <span className="text-[#141d38] font-bold block">{p.insurancePolicy?.policyName || 'N/A'}</span>
                        </td>
                        <td className="px-3 py-4 text-sm text-slate-600 align-middle font-medium">
                          {p.vehicleMake} {p.vehicleModel}
                        </td>
                        <td className="px-3 py-4 text-sm text-slate-600 align-middle text-right">
                          <button 
                            className={`inline-flex items-center gap-1.5 text-xs font-bold py-2 px-3.5 rounded-lg transition-all duration-200 ${
                              selectedProposal?.proposalId === p.proposalId 
                                ? 'bg-[#141d38] text-[#fcdb32]' 
                                : 'bg-slate-100 hover:bg-[#fcdb32] hover:text-[#141d38] text-slate-700 hover:shadow-sm'
                            }`}
                            onClick={() => setSelectedProposal(p)}
                          >
                            <Eye size={14} />
                            <span>Evaluate</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-4 mt-4 gap-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition duration-150"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
                        currentPage === page
                          ? 'bg-[#141d38] text-[#fcdb32] shadow-sm'
                          : 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition duration-150"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Proposal Review Evaluation Block */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-fit transition-all duration-300">
          {selectedProposal ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-[#141d38] flex items-center gap-2">
                  <span className="bg-[#fcdb32] text-[#141d38] text-[10px] uppercase font-bold py-1 px-2.5 rounded">ID #{selectedProposal.proposalId}</span>
                  Evaluate Proposal
                </h3>
              </div>

              <div className="space-y-4">
                
                {/* Insurance Policy Detail Section */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5 hover:shadow-inner transition-shadow duration-300">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#141d38] uppercase tracking-wider mb-2">
                    <FileText size={14} className="text-[#fcdb32]" />
                    <span>Insurance Policy Plan</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Plan Name:</span>
                    <span className="text-[#141d38] font-bold">{selectedProposal.insurancePolicy?.policyName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Type / Limit:</span>
                    <span className="text-slate-700 font-semibold">{selectedProposal.insurancePolicy?.policyType} / ₹{selectedProposal.insurancePolicy?.coverageAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Base Premium:</span>
                    <span className="text-[#141d38] font-bold text-md">₹{selectedProposal.insurancePolicy?.basePremium}</span>
                  </div>
                </div>

                {/* Vehicle Information Section */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5 hover:shadow-inner transition-shadow duration-300">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#141d38] uppercase tracking-wider mb-2">
                    <Truck size={14} className="text-[#fcdb32]" />
                    <span>Vehicle Information</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Make & Model:</span>
                    <span className="text-slate-700 font-semibold">{selectedProposal.vehicleMake} {selectedProposal.vehicleModel} ({selectedProposal.vehicleYear})</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Reg Number:</span>
                    <span className="text-[#141d38] font-extrabold tracking-wider">{selectedProposal.vehicleNumber}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm border-t border-slate-200/50 pt-2 mt-1">
                    <span className="text-slate-500 font-medium text-xs">Engine / Chassis Number:</span>
                    <span className="text-slate-800 font-mono text-xs truncate" title={`${selectedProposal.engineNumber} / ${selectedProposal.chassisNumber}`}>
                      {selectedProposal.engineNumber} / {selectedProposal.chassisNumber}
                    </span>
                  </div>
                </div>

                {/* Requested Add-On Covers Section */}
                {selectedProposal.proposalAddOns && selectedProposal.proposalAddOns.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5">
                    <h4 className="text-xs font-extrabold text-[#141d38] uppercase tracking-wider mb-2">Requested Add-on Covers</h4>
                    <ul className="space-y-1.5 pl-2 text-xs text-slate-600 font-medium">
                      {selectedProposal.proposalAddOns.map(ao => (
                        <li key={ao.addOnId} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#fcdb32]"></span>
                          <span>
                            {ao.addOn?.addOnName} <strong className="text-slate-700 font-semibold">(+ ₹{ao.addOn?.additionalCost})</strong>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Decision Review Form */}
              <form onSubmit={handleProposalReviewSubmit} className="border-t border-slate-100 pt-5 space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Underwriting Decision</label>
                  <select 
                    value={proposalReviewData.status}
                    onChange={e => setProposalReviewData({...proposalReviewData, status: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/15 transition duration-200 text-sm font-semibold"
                  >
                    <option value="Approved">Approve Application</option>
                    <option value="Rejected">Reject Application</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Decision Remarks / Notes</label>
                  <textarea 
                    required
                    rows="3"
                    maxLength="500"
                    placeholder="Provide details for approval limits or reason for rejection..."
                    value={proposalReviewData.officerRemarks}
                    onChange={e => setProposalReviewData({...proposalReviewData, officerRemarks: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/15 transition duration-200 text-sm placeholder-slate-400"
                  />
                </div>

                <Button 
                  type="submit" 
                >
                  <Check size={16} className='flex justify-start items-center' />
                  <span>Submit Decision</span>
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 space-y-4">
              <div className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-full">
                <Info size={32} className="stroke-1" />
              </div>
              <p className="text-sm font-medium text-slate-600 max-w-[200px] mx-auto">
                Select a proposal from the underwriting queue to begin auditing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewProposalsTab;