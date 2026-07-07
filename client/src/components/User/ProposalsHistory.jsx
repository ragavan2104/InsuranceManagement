import React from 'react';

const ProposalsHistory = ({ proposals }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': 
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Approved': 
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Rejected': 
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'PolicyIssued': 
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default: 
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:scale-[1.005] transition-all duration-300 ease-out">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
        <h3 className="text-base font-bold text-slate-800">Proposal Applications History</h3>
      </div>
      {proposals.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <p className="text-sm">No proposals submitted yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Reference ID</th>
                <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Policy Name</th>
                <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Vehicle</th>
                <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map(p => (
                <tr key={p.proposalId} className="hover:bg-slate-50/40 transition duration-150">
                  <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                    <span className="font-semibold text-slate-700">#{p.proposalId}</span>
                  </td>
                  <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                    <span className="font-medium text-slate-800">{p.insurancePolicy?.policyName || 'N/A'}</span>
                  </td>
                  <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                    <span className="text-slate-600">{p.vehicleMake} {p.vehicleModel}</span>
                  </td>
                  <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle text-right">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(p.status)}`}>
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
  );
};

export default ProposalsHistory;
