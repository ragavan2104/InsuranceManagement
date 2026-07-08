import React, { useEffect } from 'react';
import { FileCheck, Clock, ShieldAlert, TrendingUp, Info } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const UserStats = ({ activeCount = 0, pendingCount = 0, claimsCount = 0 }) => {
  
  // Dynamically inject react-toastify CSS to guarantee perfect rendering inside the Canvas environment
  useEffect(() => {
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
  }, []);

  // Interactive card detail feedback
  const handleCardClick = (type, count) => {
    switch (type) {
      case 'active':
        toast.success(`You have ${count} Active Policy covers providing standard protection.`, {
          icon: <FileCheck className="text-emerald-500" size={18} />
        });
        break;
      case 'pending':
        toast.info(`Underwriters are auditing ${count} pending policy forms in the queue.`, {
          icon: <Clock className="text-amber-500" size={18} />
        });
        break;
      case 'claims':
        if (count > 0) {
          toast.warning(`${count} claims are currently logged under active evaluation.`, {
            icon: <ShieldAlert className="text-rose-500" size={18} />
          });
        } else {
          toast.info("Excellent! Your account has zero outstanding claims settlements.");
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative w-full">
      
      {/* Toast Notification Layer */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
        
        {/* Active Policies Card - Premium Bigstone & Brightsun Highlight */}
        <div 
          onClick={() => handleCardClick('active', activeCount)}
          className="group cursor-pointer bg-[#141d38] text-white rounded-2xl border-2 border-slate-100/5 shadow-sm p-6 flex items-center justify-between hover:shadow-xl hover:shadow-[#141d38]/10 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
        >
          {/* Subtle Background Glow Accent */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#fcdb32]/10 rounded-full blur-xl group-hover:scale-150 transition-all duration-300"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-[#fcdb32] text-[#141d38] rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FileCheck size={24} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-[#fcdb32] uppercase tracking-widest mb-0.5">
                Active Policies
              </span>
              <span className="text-3xl font-extrabold tracking-tight text-white">
                {activeCount}
              </span>
            </div>
          </div>
          <div className="text-[#fcdb32]/50 group-hover:text-[#fcdb32] transition-colors self-start p-1">
            <TrendingUp size={16} />
          </div>
        </div>

        {/* Pending Applications Card */}
        <div 
          onClick={() => handleCardClick('pending', pendingCount)}
          className="group cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between hover:shadow-xl hover:border-[#fcdb32]/50 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
        >
          {/* Subtle Background Glow Accent */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-50 rounded-full blur-xl group-hover:scale-150 transition-all duration-300"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-110 transition-transform duration-300">
              <Clock size={24} className="stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                Pending Applications
              </span>
              <span className="text-3xl font-extrabold tracking-tight text-[#141d38]">
                {pendingCount}
              </span>
            </div>
          </div>
          <div className="text-slate-300 group-hover:text-amber-500 transition-colors self-start p-1">
            <Info size={16} />
          </div>
        </div>

        {/* Filed Claims Card */}
        <div 
          onClick={() => handleCardClick('claims', claimsCount)}
          className="group cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-between hover:shadow-xl hover:border-rose-200 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
        >
          {/* Subtle Background Glow Accent */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-50 rounded-full blur-xl group-hover:scale-150 transition-all duration-300"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100 group-hover:scale-110 transition-transform duration-300">
              <ShieldAlert size={24} className="stroke-[2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">
                Filed Claims
              </span>
              <span className="text-3xl font-extrabold tracking-tight text-[#141d38]">
                {claimsCount}
              </span>
            </div>
          </div>
          <div className="text-slate-300 group-hover:text-rose-500 transition-colors self-start p-1">
            <Info size={16} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserStats;