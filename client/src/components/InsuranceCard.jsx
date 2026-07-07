import React from 'react';
import { Shield } from 'lucide-react';

const InsuranceCard = ({ policy, onSelect, actionText, showHeaderIcon = true }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {showHeaderIcon && <Shield size={20} className="text-blue-600 shrink-0" />}
          <h4 className="font-bold text-slate-800 text-base leading-snug">{policy.policyName}</h4>
        </div>
        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
          {policy.policyType}
        </span>
      </div>
      
      <div className="p-6 flex-grow flex flex-col justify-between gap-6">
        <p className="text-sm text-slate-500 leading-relaxed">{policy.description}</p>
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Base Premium</span>
            <span className="text-sm font-bold text-slate-700">₹{policy.basePremium}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max Cover</span>
            <span className="text-sm font-bold text-slate-700">₹{policy.coverageAmount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</span>
            <span className="text-sm font-bold text-slate-700">{policy.policyDurationMonths} Mo</span>
          </div>
        </div>
      </div>

      {onSelect && (
        <div className="p-6 pt-0">
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm cursor-pointer"
            onClick={() => onSelect(policy)}
          >
            {actionText || 'Select Plan'}
          </button>
        </div>
      )}
    </div>
  );
};

export default InsuranceCard;
