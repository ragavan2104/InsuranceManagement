import React, { useState, useEffect } from 'react';
import { getAllClaimsHistory } from '../../services/claimService';
import Loader from '../loader';
import { Search, Info, Calendar } from 'lucide-react';

// Import react-toastify assets and methods
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AllClaimsHistoryTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [claims, setClaims] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllClaimsHistory();
      setClaims(data);
      // Success toast trigger
      toast.success('Claims history database synchronized successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error(err);
      const errMsg = 'Failed to fetch claims history database.';
      setError(errMsg);
      // Error toast trigger
      toast.error(errMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ClaimFiled':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'UnderReview':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60';
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

  const totalItems = filteredClaims.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClaims = filteredClaims.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Toast Notification Container */}
      <ToastContainer toastClassName="rounded-xl font-medium text-sm shadow-md" />

      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center">
          <Loader />
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm transition-all">
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Search header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-950 tracking-tight">Claims Administration Directory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track, search, and monitor claims settlement histories</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by policy, ID, incident..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-xs"
            />
          </div>
        </div>

        {filteredClaims.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Info size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium">No claims found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4">ID</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Policy Number</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Policy Name</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Incident Date</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Incident details</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4">Est. Loss / Settlement</th>
                  <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedClaims.map(c => (
                  <tr key={c.claimId} className="hover:bg-slate-50/30 transition duration-150">
                    <td className="px-6 py-4 text-xs text-slate-600 align-middle whitespace-nowrap">
                      <span className="font-bold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded">#{c.claimId}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-bold align-middle whitespace-nowrap">
                      {c.policyNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 align-middle">
                      <strong className="text-slate-700 font-semibold">{c.policyName}</strong>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 align-middle whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{new Date(c.incidentDate).toLocaleDateString()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 align-middle max-w-xs">
                      <span className="block truncate font-medium text-slate-700" title={c.incidentDescription}>
                        {c.incidentDescription}
                      </span>
                      {c.officerRemarks && (
                        <span className="block text-[10px] text-slate-400 italic mt-0.5 truncate" title={`Auditor notes: ${c.officerRemarks}`}>
                          Audit: {c.officerRemarks}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 align-middle whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-500 font-medium">Loss: <strong className="text-slate-700">₹{c.estimatedLossAmount}</strong></span>
                        {c.status === 'Approved' && (
                          <span className="text-emerald-600 font-bold">Paid: ₹{c.approvedSettlementAmount}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm align-middle text-right whitespace-nowrap">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls footer */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 p-6 gap-4 bg-slate-50/20">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition duration-150"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition duration-150 cursor-pointer ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition duration-150"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllClaimsHistoryTab;