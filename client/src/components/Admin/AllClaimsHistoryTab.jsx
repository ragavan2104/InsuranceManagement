import React, { useState, useEffect } from 'react';
import { getAllClaimsHistory } from '../../services/claimService';
import Loader from '../loader';
import { Search, Info, Calendar } from 'lucide-react';

const AllClaimsHistoryTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [claims, setClaims] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllClaimsHistory();
      setClaims(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch claims history database.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ClaimFiled':
        return 'bg-amber-50 text-amber-700 border-amber-100/50';
      case 'UnderReview':
        return 'bg-blue-50 text-blue-700 border-blue-100/50';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100/50';
    }
  };

  const filteredClaims = claims.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      (c.policyNumber || '').toLowerCase().includes(query) ||
      (c.policyName || '').toLowerCase().includes(query) ||
      (c.incidentDescription || '').toLowerCase().includes(query) ||
      (c.status || '').toLowerCase().includes(query) ||
      c.claimId.toString().includes(query)
    );
  });

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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {/* Search header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-5 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-800">Claims Administration Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track, search, and monitor claims settlement histories</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by policy, ID, incident..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-xs"
            />
          </div>
        </div>

        {filteredClaims.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Info size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No claims found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">ID</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Policy Number</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Policy Name</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Incident Date</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Incident details</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Est. Loss / Settlement</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map(c => (
                  <tr key={c.claimId} className="hover:bg-slate-50/30 transition duration-150 border-b border-slate-50">
                    <td className="py-4 text-sm text-slate-600 align-middle">
                      <span className="font-semibold text-slate-700">#{c.claimId}</span>
                    </td>
                    <td className="py-4 text-sm text-slate-800 font-bold align-middle">
                      {c.policyNumber}
                    </td>
                    <td className="py-4 text-sm text-slate-600 align-middle">
                      <strong className="text-slate-700 font-semibold">{c.policyName}</strong>
                    </td>
                    <td className="py-4 text-xs text-slate-500 align-middle">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{new Date(c.incidentDate).toLocaleDateString()}</span>
                      </span>
                    </td>
                    <td className="py-4 text-xs text-slate-600 align-middle max-w-xs">
                      <span className="block truncate" title={c.incidentDescription}>{c.incidentDescription}</span>
                      {c.officerRemarks && (
                        <span className="block text-[10px] text-slate-400 italic mt-0.5 truncate" title={`Auditor notes: ${c.officerRemarks}`}>
                          Audit: {c.officerRemarks}
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-xs text-slate-600 align-middle">
                      <div className="flex flex-col">
                        <span className="text-slate-600 font-medium">Loss: ₹{c.estimatedLossAmount}</span>
                        {c.status === 'Approved' && (
                          <span className="text-emerald-600 font-bold mt-0.5">Paid: ₹{c.approvedSettlementAmount}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-sm align-middle text-right">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllClaimsHistoryTab;
