import React, { useEffect } from 'react';
import { Shield, Star, Sparkles, Check } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import Button from './Common/Button';

const InsuranceCard = ({ policy = {}, onSelect, actionText, showHeaderIcon = true }) => {
  
  // Safely inject Toastify CSS dynamically via CDN link to avoid bundler compile blocks on the Canvas
  useEffect(() => {
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
  }, []);

  const handleSelectPlan = () => {
    toast.success(`Excellent! You selected the "${policy.policyName || 'Standard Plan'}" plan.`, {
      icon: <Sparkles className="text-[#fcdb32]" size={18} />
    });
    
    if (onSelect) {
      // Delay navigation/action slightly to ensure the notification is beautifully registered
      setTimeout(() => {
        onSelect(policy);
      }, 800);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-[#141d38]/5 hover:border-[#fcdb32]/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full overflow-hidden group">
      
      {/* Toast Notification Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Interactive Top Border Highlight */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#141d38] group-hover:bg-[#fcdb32] transition-colors duration-300" />

      {/* Card Header */}
      <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 pt-7">
        <div className="flex items-center gap-3">
          {showHeaderIcon && (
            <div className="p-2.5 bg-[#141d38]/5 group-hover:bg-[#fcdb32]/20 text-[#141d38] rounded-xl transition-colors duration-300 shrink-0">
              <Shield size={20} className="stroke-[2.5]" />
            </div>
          )}
          <h4 className="font-extrabold text-[#141d38] text-base leading-snug tracking-tight">
            {policy.policyName || 'Standard Policy Plan'}
          </h4>
        </div>
        <span className="bg-[#141d38] text-[#fcdb32] text-[10px] font-extrabold px-3 py-1 rounded-full shrink-0 uppercase tracking-widest border border-[#141d38]">
          {policy.policyType || 'Comprehensive'}
        </span>
      </div>
      
      {/* Description & Plan Info Body */}
      <div className="p-6 flex-grow flex flex-col justify-between gap-6">
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          {policy.description || 'Secure your vehicle with our comprehensive coverage against natural damage, accidents, third-party liabilities, and instant settlements.'}
        </p>
        
        {/* Coverage Parameters Info Block */}
        <div className="grid grid-cols-3 gap-4 pt-5 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Base Premium</span>
            <span className="text-sm font-black text-[#141d38]">₹{policy.basePremium || '0'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Max Cover</span>
            <span className="text-sm font-black text-[#141d38] ">₹{policy.coverageAmount || '0'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Duration</span>
            <span className="text-sm font-black text-slate-700">{policy.policyDurationMonths || '12'} Mo</span>
          </div>
        </div>
      </div>

      {/* Plan Selection Action Trigger */}
      {onSelect && (
        <div className="p-6 pt-0 mt-auto">
          <Button 
            onClick={handleSelectPlan}
          >
            <span>{actionText || 'Select Plan'}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default InsuranceCard;