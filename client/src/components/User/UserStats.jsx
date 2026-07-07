import React from 'react';
import { FileCheck, Clock, ShieldAlert } from 'lucide-react';

const UserStats = ({ activeCount, pendingCount, claimsCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md hover:scale-[1.01] transition-all duration-300 ease-out">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <FileCheck size={22} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Active Policies</span>
          <span className="text-2xl font-bold text-slate-800">{activeCount}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md hover:scale-[1.01] transition-all duration-300 ease-out">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
          <Clock size={22} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Pending Applications</span>
          <span className="text-2xl font-bold text-slate-800">{pendingCount}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md hover:scale-[1.01] transition-all duration-300 ease-out">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
          <ShieldAlert size={22} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Filed Claims</span>
          <span className="text-2xl font-bold text-slate-800">{claimsCount}</span>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
