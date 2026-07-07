import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

const DuePayments = ({ approvedProposals }) => {
  const navigate = useNavigate();

  if (approvedProposals.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 mb-6 hover:shadow-md hover:scale-[1.005] transition-all duration-300 ease-out col-span-full">
      <div className="flex items-center gap-2.5 mb-4 text-red-600 font-bold border-b border-red-50 pb-3">
        <CreditCard size={20} className="shrink-0" />
        <h3 className="text-base font-bold">Payments Due</h3>
      </div>
      <div className="space-y-4">
        {approvedProposals.map(p => (
          <div key={p.proposalId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50/30 rounded-xl border border-red-50/50">
            <div className="flex flex-col">
              <strong className="text-sm font-bold text-slate-800">{p.insurancePolicy?.policyName || 'Standard Policy'}</strong>
              <span className="text-xs text-slate-500 mt-0.5">Vehicle: {p.vehicleMake} {p.vehicleModel} ({p.vehicleNumber})</span>
              <span className="text-xs font-semibold text-red-600 mt-0.5">Premium: ₹{p.insurancePolicy?.basePremium}</span>
            </div>
            <button 
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md self-start sm:self-center shrink-0 cursor-pointer"
              onClick={() => navigate('/checkout', { 
                state: { 
                  proposalId: p.proposalId, 
                  amount: p.insurancePolicy?.basePremium, 
                  policyName: p.insurancePolicy?.policyName 
                } 
              })}
            >
              <CreditCard size={14} />
              <span>Pay Premium</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DuePayments;
