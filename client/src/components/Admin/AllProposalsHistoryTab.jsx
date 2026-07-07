import React, { useState, useEffect } from 'react';
import { getAllProposalsHistory } from '../../services/proposalService';
import Loader from '../loader';
import { Search, Info, Calendar } from 'lucide-react';

const AllProposalsHistoryTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proposals, setProposals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllProposalsHistory();
      setProposals(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch proposals history catalog.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100/50';
      case 'Approved':
        return 'bg-blue-50 text-blue-700 border-blue-100/50';
      case 'PolicyIssued':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100/50';
    }
  };

  const filteredProposals = proposals.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      (p.customerName || '').toLowerCase().includes(query) ||
      (p.policyName || '').toLowerCase().includes(query) ||
      (p.vehicleNumber || '').toLowerCase().includes(query) ||
      p.proposalId.toString().includes(query)
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
            <h3 className="text-base font-bold text-slate-800">Proposals Administration Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">List and review active, approved, pending, or rejected coverages</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, ID, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-xs"
            />
          </div>
        </div>

        {filteredProposals.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Info size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No proposals found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">ID</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Customer</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Policy Cover</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Vehicle details</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Premium Amount</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Date Applied</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProposals.map(p => (
                  <tr key={p.proposalId} className="hover:bg-slate-50/30 transition duration-150">
                    <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                      <span className="font-semibold text-slate-700">#{p.proposalId}</span>
                    </td>
                    <td className="py-4 text-sm text-slate-800 font-semibold border-b border-slate-50 align-middle">
                      {p.customerName}
                    </td>
                    <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                      <strong className="text-slate-700 font-semibold">{p.policyName}</strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{p.policyType}</span>
                    </td>
                    <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                      <span className="text-slate-700 font-medium block">{p.vehicleMake} {p.vehicleModel}</span>
                      <span className="text-xs text-slate-400 mt-0.5 block">{p.vehicleNumber}</span>
                    </td>
                    <td className="py-4 text-sm text-slate-700 font-bold border-b border-slate-50 align-middle">
                      ₹{p.totalCalculatedPremium || p.calculatedPremium}
                    </td>
                    <td className="py-4 text-xs text-slate-500 border-b border-slate-50 align-middle">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle text-right">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(p.status)}`}>
                        {p.status}
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

export default AllProposalsHistoryTab;
