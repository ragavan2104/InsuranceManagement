import React, { useState, useEffect } from 'react';
import Loader from '../loader';
import { Eye, Info, Check } from 'lucide-react';
import { getPendingProposals, reviewProposal } from '../../services/proposalService';

const ReviewProposalsTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pendingProposals, setPendingProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [proposalReviewData, setProposalReviewData] = useState({
    status: 'Approved',
    officerRemarks: ''
  });

  useEffect(() => {
    fetchQueueData();
  }, []);

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPendingProposals();
      setPendingProposals(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pending proposals queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleProposalReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProposal) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await reviewProposal(selectedProposal.proposalId, {
        status: proposalReviewData.status,
        officerRemarks: proposalReviewData.officerRemarks
      });
      
      setSuccess(`Proposal ID #${selectedProposal.proposalId} has been successfully marked as ${proposalReviewData.status}.`);
      setSelectedProposal(null);
      setProposalReviewData({ status: 'Approved', officerRemarks: '' });
      fetchQueueData();
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          setError(data);
        } else if (data.errors) {
          setError(Object.values(data.errors).flat().join(', '));
        } else {
          setError(data.message || data.title || 'Failed to submit proposal review.');
        }
      } else {
        setError('Failed to submit proposal review.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center">
          <Loader />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm font-medium">
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="border-b border-slate-50 pb-4 mb-4">
            <h3 className="text-base font-bold text-slate-800">Underwriting Review Queue</h3>
          </div>
          {pendingProposals.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">All clear! There are no pending proposal applications in the queue.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">ID</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">User ID</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Policy</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Vehicle</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingProposals.map(p => (
                    <tr key={p.proposalId} className={`hover:bg-slate-50/40 transition duration-150 ${selectedProposal?.proposalId === p.proposalId ? 'bg-blue-50/30' : ''}`}>
                      <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                        <span className="font-semibold text-slate-700">#{p.proposalId}</span>
                      </td>
                      <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                        User #{p.userId}
                      </td>
                      <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                        <strong className="text-slate-800 font-semibold">{p.insurancePolicy?.policyName || 'N/A'}</strong>
                      </td>
                      <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                        {p.vehicleMake} {p.vehicleModel}
                      </td>
                      <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle text-right">
                        <button 
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-semibold py-1.5 px-3 rounded-lg transition duration-200"
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
        </div>

        {/* Proposal review evaluation block */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-fit">
          {selectedProposal ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-800">Evaluate Proposal #{selectedProposal.proposalId}</h3>
              </div>

              <div className="space-y-5">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Insurance Policy Plan</h4>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span className="text-slate-400 font-medium">Plan Name:</span>
                    <span className="text-slate-800 font-bold">{selectedProposal.insurancePolicy?.policyName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span className="text-slate-400 font-medium">Type / Limit:</span>
                    <span className="text-slate-800 font-medium">{selectedProposal.insurancePolicy?.policyType} / ₹{selectedProposal.insurancePolicy?.coverageAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span className="text-slate-400 font-medium">Base Premium:</span>
                    <span className="text-slate-800 font-semibold">₹{selectedProposal.insurancePolicy?.basePremium}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Vehicle Information</h4>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span className="text-slate-400 font-medium">Make & Model:</span>
                    <span className="text-slate-800 font-semibold">{selectedProposal.vehicleMake} {selectedProposal.vehicleModel} ({selectedProposal.vehicleYear})</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span className="text-slate-400 font-medium">Reg Number:</span>
                    <span className="text-slate-800 font-bold">{selectedProposal.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span className="text-slate-400 font-medium">Engine / Chassis:</span>
                    <span className="text-slate-800 font-medium text-xs truncate max-w-[150px]">{selectedProposal.engineNumber} / {selectedProposal.chassisNumber}</span>
                  </div>
                </div>

                {selectedProposal.proposalAddOns && selectedProposal.proposalAddOns.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requested Add-on Covers</h4>
                    <ul className="space-y-1.5 list-disc pl-5 text-xs text-slate-600 font-medium">
                      {selectedProposal.proposalAddOns.map(ao => (
                        <li key={ao.addOnId}>
                          {ao.addOn?.addOnName} (+ ₹{ao.addOn?.additionalPremium})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <form onSubmit={handleProposalReviewSubmit} className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Underwriting Decision</label>
                  <select 
                    value={proposalReviewData.status}
                    onChange={e => setProposalReviewData({...proposalReviewData, status: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                  >
                    <option value="Approved">Approve Application</option>
                    <option value="Rejected">Reject Application</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Decision Remarks / Underwriting Notes</label>
                  <textarea 
                    required
                    rows="3"
                    maxLength="500"
                    placeholder="Provide details for approval limits or reason for rejection..."
                    value={proposalReviewData.officerRemarks}
                    onChange={e => setProposalReviewData({...proposalReviewData, officerRemarks: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                  />
                </div>

                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 text-sm">
                  <Check size={16} />
                  <span>Submit Decision</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Info size={32} className="mx-auto mb-3" />
              <p className="text-sm">Select a proposal from the underwriting queue to begin auditing the application details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewProposalsTab;
