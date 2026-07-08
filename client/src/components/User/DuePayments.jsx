import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, AlertTriangle, ArrowRight, DollarSign, CalendarCheck } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const DuePayments = ({ approvedProposals = [] }) => {
  const navigate = useNavigate();

  // Safely inject Toastify CSS dynamically via CDN link to avoid compile blocks
  useEffect(() => {
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
  }, []);

  if (approvedProposals.length === 0) return null;

  const handlePaymentNavigation = (proposal) => {
    toast.info(`Redirecting to checkout for ${proposal.insurancePolicy?.policyName || 'Policy'}...`);
    
    // Simulate minor delay to allow user to see toast confirmation before navigate
    setTimeout(() => {
      navigate('/checkout', { 
        state: { 
          proposalId: proposal.proposalId, 
          amount: proposal.insurancePolicy?.basePremium, 
          policyName: proposal.insurancePolicy?.policyName 
        } 
      });
    }, 800);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 hover:shadow-md transition-all duration-300 col-span-full relative overflow-hidden">
      
      {/* Toast Notification Layer */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      {/* Decorative Brand Top Banner Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#141d38] via-[#fcdb32] to-[#141d38]" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
        <div className="flex items-center gap-3 text-[#141d38]">
          <div className="p-2 bg-[#fcdb32]/10 rounded-xl text-[#141d38] animate-pulse">
            <CreditCard size={20} className="shrink-0" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#141d38]">Outstanding Payments Due</h3>
            <p className="text-xs text-slate-400 mt-0.5">Your policy proposals have been approved. Complete your payment to initiate active coverage.</p>
          </div>
        </div>
        <span className="bg-[#141d38] text-[#fcdb32] text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider self-start sm:self-center">
          {approvedProposals.length} Action Required
        </span>
      </div>

      {/* Dynamic List Section */}
      <div className="space-y-4">
        {approvedProposals.map(p => (
          <div 
            key={p.proposalId} 
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50/50 hover:bg-[#141d38]/5 rounded-xl border border-slate-100 hover:border-[#fcdb32]/40 transition-all duration-300"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-white border border-slate-100 rounded-xl hidden md:flex text-slate-400 group-hover:text-[#141d38] transition-colors duration-300">
                <CalendarCheck size={20} />
              </div>
              <div className="flex flex-col">
                <strong className="text-sm font-bold text-[#141d38] group-hover:text-black transition-colors duration-300">
                  {p.insurancePolicy?.policyName || 'Standard Policy'}
                </strong>
                <span className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="bg-slate-200 text-slate-700 font-mono text-[9px] px-2 py-0.5 rounded">IDV: Approved</span>
                  <span>Vehicle: {p.vehicleMake} {p.vehicleModel} ({p.vehicleNumber})</span>
                </span>
                <span className="text-xs font-extrabold text-[#141d38] mt-2 flex items-center gap-1">
                  <span className="text-slate-400 font-semibold">Premium Amount Due:</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-extrabold">₹{p.insurancePolicy?.basePremium}</span>
                </span>
              </div>
            </div>

            {/* Premium Button Action */}
            <button 
              className="flex items-center justify-center gap-2 bg-[#141d38] hover:bg-[#141d38]/90 text-[#fcdb32] text-xs font-bold py-3 px-5 rounded-xl transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] self-start sm:self-center shrink-0 cursor-pointer"
              onClick={() => handlePaymentNavigation(p)}
            >
              <CreditCard size={14} />
              <span>Pay Premium</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        ))}
      </div>

      {/* Warning Tip */}
      <div className="mt-5 p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2.5">
        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <span className="text-[11px] text-amber-700 font-medium leading-relaxed">
          <strong>Important Security Notice:</strong> Complete your transaction safely via our verified payment gateway. Once processed, your policy coverage starts immediately.
        </span>
      </div>

    </div>
  );
};

export default DuePayments;