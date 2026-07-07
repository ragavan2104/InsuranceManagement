import React, { useState, useEffect } from 'react';
import Loader from '../loader';
import { Eye, Info, Check } from 'lucide-react';
import { getPendingClaimsQueue, reviewClaim } from '../../services/claimService';

const ReviewClaimsTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pendingClaims, setPendingClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimReviewData, setClaimReviewData] = useState({
    status: 'Approved',
    approvedSettlementAmount: '',
    officerRemarks: ''
  });

  useEffect(() => {
    fetchQueueData();
  }, []);

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPendingClaimsQueue();
      setPendingClaims(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch pending claims queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const payload = {
        status: claimReviewData.status,
        approvedSettlementAmount: claimReviewData.status === 'Approved' 
          ? parseFloat(claimReviewData.approvedSettlementAmount) 
          : 0,
        officerRemarks: claimReviewData.officerRemarks
      };

      await reviewClaim(selectedClaim.claimId, payload);
      
      setSuccess(`Claim ID #${selectedClaim.claimId} has been successfully marked as ${claimReviewData.status}.`);
      setSelectedClaim(null);
      setClaimReviewData({ status: 'Approved', approvedSettlementAmount: '', officerRemarks: '' });
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
          setError(data.message || data.title || 'Failed to submit claim review.');
        }
      } else {
        setError('Failed to submit claim review.');
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
            <h3 className="text-base font-bold text-slate-800">Claims Settlement Queue</h3>
          </div>
          {pendingClaims.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">All clear! There are no outstanding claims awaiting auditing.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">ID</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Policy Num</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Incident</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Estimated Loss</th>
                    <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingClaims.map(c => (
                    <tr key={c.claimId} className={`hover:bg-slate-50/40 transition duration-150 ${selectedClaim?.claimId === c.claimId ? 'bg-blue-50/30' : ''}`}>
                      <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                        <span className="font-semibold text-slate-700">#{c.claimId}</span>
                      </td>
                      <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                        <strong className="text-slate-800 font-semibold">{c.policyNumber}</strong>
                      </td>
                      <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle max-w-xs">
                        <span className="text-slate-700 font-medium block truncate" title={c.incidentDescription}>{c.incidentDescription}</span>
                      </td>
                      <td className="py-4 text-sm text-slate-700 font-semibold border-b border-slate-50 align-middle">
                        ₹{c.estimatedLossAmount}
                      </td>
                      <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle text-right">
                        <button 
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs font-semibold py-1.5 px-3 rounded-lg transition duration-200"
                          onClick={() => setSelectedClaim(c)}
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

        {/* Claims review evaluation block */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-fit">
          {selectedClaim ? (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-800">Evaluate Claim #{selectedClaim.claimId}</h3>
              </div>

              <div className="space-y-5">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Claim Incident Details</h4>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span className="text-slate-400 font-medium">Policy Number:</span>
                    <span className="text-slate-800 font-bold">{selectedClaim.policyNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span className="text-slate-400 font-medium">Policy Cover Name:</span>
                    <span className="text-slate-800 font-semibold">{selectedClaim.policyName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span className="text-slate-400 font-medium">Incident Date:</span>
                    <span className="text-slate-800 font-medium">{new Date(selectedClaim.incidentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span className="text-slate-400 font-medium">Estimated Loss:</span>
                    <span className="text-red-600 font-bold">₹{selectedClaim.estimatedLossAmount}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description of Damage</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedClaim.incidentDescription}</p>
                </div>
              </div>

              {/* Claim Review Form */}
              <form onSubmit={handleClaimReviewSubmit} className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Auditing Status</label>
                  <select 
                    value={claimReviewData.status}
                    onChange={e => setClaimReviewData({...claimReviewData, status: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                  >
                    <option value="Approved">Approve Settlement</option>
                    <option value="Rejected">Reject Claim</option>
                  </select>
                </div>

                {claimReviewData.status === 'Approved' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Settlement Amount (₹)</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      max={selectedClaim.estimatedLossAmount}
                      placeholder={`Max liability: ₹${selectedClaim.estimatedLossAmount}`}
                      value={claimReviewData.approvedSettlementAmount}
                      onChange={e => setClaimReviewData({...claimReviewData, approvedSettlementAmount: e.target.value})}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Must be less than or equal to the estimated loss amount of ₹{selectedClaim.estimatedLossAmount}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Auditing Notes / Settlement Remarks</label>
                  <textarea 
                    required
                    rows="3"
                    maxLength="500"
                    placeholder="Provide details explaining the approval amount or rejection cause..."
                    value={claimReviewData.officerRemarks}
                    onChange={e => setClaimReviewData({...claimReviewData, officerRemarks: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                  />
                </div>

                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 text-sm">
                  <Check size={16} />
                  <span>Submit Claim Audit</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Info size={32} className="mx-auto mb-3" />
              <p className="text-sm">Select a claim from the settlement queue to audit incidents, values, and approve settlements.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewClaimsTab;
