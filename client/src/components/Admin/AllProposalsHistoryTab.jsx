import React, { useState, useEffect } from 'react';
import { Search, Info, Calendar } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import Loader from '../loader';
import { getAllProposalsHistory } from '../../services/proposalService';


export default function AllProposalsHistoryTab() {
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    // Dynamically injecting Toastify CSS for the preview environment
    if (!document.getElementById('toastify-css')) {
      const link = document.createElement('link');
      link.id = 'toastify-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify/dist/ReactToastify.min.css';
      document.head.appendChild(link);
    }
    
    // Injecting Tailwind config for the preview environment
    if (!document.getElementById('tailwind-config')) {
      const script = document.createElement('script');
      script.id = 'tailwind-config';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
      script.onload = () => {
        window.tailwind.config = {
          theme: {
            extend: {
              colors: {
                brightsun: '#fcdb32',
                bigstone: '#141d38',
              }
            }
          }
        };
      };
    }
    
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getAllProposalsHistory();
      setProposals(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch proposals history catalog.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-brightsun/20 text-bigstone border-brightsun/50';
      case 'Approved':
        return 'bg-bigstone/10 text-bigstone border-bigstone/20';
      case 'PolicyIssued':
        return 'bg-bigstone text-brightsun border-bigstone';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-100/50';
      default:
        return 'bg-bigstone/5 text-bigstone/70 border-bigstone/10';
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

  const totalItems = filteredProposals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProposals = filteredProposals.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 min-h-screen p-8 bg-gray-50">
      <ToastContainer position="top-right" />
      
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-bigstone/10 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
        {/* Search header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bigstone/5 pb-5 mb-5">
          <div>
            <h3 className="text-lg font-bold text-bigstone">Proposals Administration Directory</h3>
            <p className="text-sm text-bigstone/60 mt-1">List and review active, approved, pending, or rejected coverages</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bigstone/50" size={18} />
            <input
              type="text"
              placeholder="Search by name, ID, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm placeholder:text-bigstone/40"
            />
          </div>
        </div>

        {filteredProposals.length === 0 ? (
          <div className="text-center py-16 text-bigstone/60 bg-bigstone/[0.02] rounded-xl border border-dashed border-bigstone/10">
            <Info size={36} className="mx-auto mb-4 text-bigstone/30" />
            <p className="text-base font-medium text-bigstone/70">No proposals found matching your criteria.</p>
            <p className="text-sm mt-1">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-bigstone/10">
                  <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-2">ID</th>
                  <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-2">Customer</th>
                  <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-2">Policy Cover</th>
                  <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-2">Vehicle details</th>
                  <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-2">Premium Amount</th>
                  <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-2">Date Applied</th>
                  <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bigstone/5">
                {paginatedProposals.map(p => (
                  <tr key={p.proposalId} className="hover:bg-brightsun/10 transition-colors duration-200 group">
                    <td className="py-4 px-2 text-sm text-bigstone/80 align-middle">
                      <span className="font-bold text-bigstone group-hover:text-bigstone transition-colors">#{p.proposalId}</span>
                    </td>
                    <td className="py-4 px-2 text-sm text-bigstone font-semibold align-middle">
                      {p.customerName}
                    </td>
                    <td className="py-4 px-2 text-sm text-bigstone/80 align-middle">
                      <strong className="text-bigstone font-semibold block">{p.policyName}</strong>
                      <span className="text-[11px] font-medium text-bigstone/60 bg-bigstone/5 px-2 py-0.5 rounded-md inline-block mt-1">{p.policyType}</span>
                    </td>
                    <td className="py-4 px-2 text-sm text-bigstone/80 align-middle">
                      <span className="text-bigstone font-medium block">{p.vehicleMake} {p.vehicleModel}</span>
                      <span className="text-xs text-bigstone/60 mt-0.5 block tracking-wide">{p.vehicleNumber}</span>
                    </td>
                    <td className="py-4 px-2 text-sm text-bigstone font-bold align-middle">
                      ₹{(p.totalCalculatedPremium || p.calculatedPremium)?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-2 text-xs text-bigstone/70 align-middle">
                      <span className="flex items-center gap-1.5 bg-bigstone/5 w-fit px-2.5 py-1 rounded-md">
                        <Calendar size={12} className="text-bigstone/50" />
                        <span className="font-medium">{new Date(p.submittedAt || p.createdAt).toLocaleDateString('en-IN')}</span>
                      </span>
                    </td>
                    <td className="py-4 px-2 text-sm text-bigstone/80 align-middle text-right">
                      <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(p.status)} shadow-sm`}>
                        {p.status}
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
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-bigstone/10 pt-5 mt-5 gap-4">
            <div className="text-xs font-bold text-bigstone/60 uppercase tracking-wider">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl border border-bigstone/20 text-xs font-bold text-bigstone bg-white hover:bg-bigstone/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition duration-200"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                    currentPage === page
                      ? 'bg-bigstone text-brightsun shadow-md'
                      : 'border border-bigstone/20 text-bigstone bg-white hover:bg-bigstone/5'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl border border-bigstone/20 text-xs font-bold text-bigstone bg-white hover:bg-bigstone/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}