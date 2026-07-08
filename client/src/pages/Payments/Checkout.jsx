import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { processCheckout } from '../../services/paymentService';
import API from '../../services/api';
import Loader from '../../components/loader';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  Info, 
  Smartphone, 
  Globe, 
  Wallet, 
  ShieldCheck, 
  Receipt,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import Button from '../../components/Common/Button';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { proposalId, amount, policyName, isRenewal, issuedPolicyId } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [transactionId, setTransactionId] = useState(`TXN-${Date.now().toString().substring(5)}`);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  // Dynamic injection of Toastify CSS to guarantee perfect presentation
  useEffect(() => {
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
  }, []);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!proposalId) {
      toast.error('Invalid Checkout Reference. Redirecting to dashboard...');
      setError('Invalid Checkout Reference. Return to dashboard.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const payload = {
        proposalId: parseInt(proposalId),
        paymentMethod,
        transactionId
      };

      const result = await processCheckout(payload);
      
      if (isRenewal && issuedPolicyId) {
        await API.post(`/IssuedPolicy/renew/${issuedPolicyId}`);
      }

      setReceipt(result);
      toast.success(isRenewal
        ? 'Payment authorized! Your policy coverage has been renewed and extended.'
        : 'Payment authorized! Your policy certificate is active.', {
        icon: <Sparkles className="text-[#fcdb32]" size={18} />
      });
    } catch (err) {
      console.error(err);
      let errMsg = 'Transaction failed. Please try again.';
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errMsg = data;
        } else if (data.errors) {
          errMsg = Object.values(data.errors).flat().join(', ');
        } else {
          errMsg = data.message || data.title || errMsg;
        }
      }
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic selector items configuration
  const paymentMethodsList = [
    { id: 'Card', label: 'Credit / Debit Card', icon: <CreditCard size={20} /> },
    { id: 'UPI', label: 'UPI Instant Pay', icon: <Smartphone size={20} /> },
    { id: 'NetBanking', label: 'Net Banking', icon: <Globe size={20} /> },
    { id: 'Wallet', label: 'Digital Wallet', icon: <Wallet size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 relative">
      
      {/* Toast Notification Deck */}
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />

      {/* Primary Loading Layer calling original Loader */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center backdrop-blur-sm transition-all duration-300">
          <Loader />
        </div>
      )}

      <div className="max-w-xl mx-auto">
        
        {/* Navigation / Header bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-8 gap-3">
          <button 
            className="flex items-center gap-2 text-slate-500 hover:text-[#141d38] text-sm font-bold transition-all duration-200 self-start group" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Dashboard</span>
          </button>
          <h2 className="text-lg font-black text-[#141d38] tracking-tight uppercase flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#fcdb32]" />
            Secure Checkout
          </h2>
        </header>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2">
            <Info size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {receipt ? (
          /* PAYMENT SUCCESS RECEIPT SCREEN */
          <div className="bg-white rounded-2xl border-t-8 border-t-emerald-500 border border-slate-100 shadow-xl p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-24 h-24 bg-emerald-50 rounded-full blur-lg pointer-events-none" />
            
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 animate-bounce">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-black text-[#141d38] mb-1">Payment Successful!</h3>
            <p className="text-sm text-emerald-600 font-extrabold mb-6 tracking-wide uppercase">Your Policy is Now Active</p>
            
            <div className="bg-slate-50/70 rounded-xl p-5 mb-6 space-y-3.5 border border-slate-100 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Policy Number:</span>
                <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">{receipt.policyNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Amount Paid:</span>
                <span className="font-black text-[#141d38] text-sm">₹{receipt.amountPaid}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Transaction Reference:</span>
                <span className="font-mono text-slate-700 font-semibold">{receipt.transactionId}</span>
              </div>
              <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Active Coverage Term:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 bg-white p-2.5 rounded border border-slate-200/50 shadow-sm mt-1">
                  <Receipt size={14} className="text-[#141d38]" />
                  {new Date(receipt.effectiveDate).toLocaleDateString()} to {new Date(receipt.expiryDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button 
              className="w-full bg-[#141d38] hover:bg-[#141d38]/95 text-[#fcdb32] font-black py-3.5 px-6 rounded-xl transition duration-200 text-xs tracking-widest uppercase active:scale-[0.98] shadow-md flex items-center justify-center gap-1.5" 
              onClick={() => navigate('/dashboard')}
            >
              <span>Go to My Coverages</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300">
            {/* Top decorative line highlight */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#141d38] via-[#fcdb32] to-[#141d38]" />

            <div className="border-b border-slate-100 pb-4 mb-6 pt-2">
              <h3 className="text-base font-extrabold text-[#141d38]">Confirm Premium Payment</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">Please authorize payment details to process and activate your instant policy certificate.</p>
            </div>

            {!proposalId ? (
              <div className="text-center py-10 text-slate-400 space-y-3">
                <p className="text-sm font-semibold">No proposal selected for checkout.</p>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl transition"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Proposal Summary Box */}
                <div className="bg-[#141d38] text-white rounded-xl p-5 space-y-3.5 border-l-4 border-l-[#fcdb32] relative overflow-hidden shadow-sm">
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-16 h-16 bg-white/5 rounded-full blur-md" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Insurance Plan:</span>
                    <span className="text-white font-extrabold">{policyName || 'Standard Policy'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Application Reference:</span>
                    <span className="text-[#fcdb32] font-mono font-extrabold">Proposal #{proposalId}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3.5 border-t border-white/10 text-sm font-black">
                    <span className="text-slate-300">Annual Premium Due:</span>
                    <span className="text-[#fcdb32] text-lg font-black">₹{amount}</span>
                  </div>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                  
                  {/* Payment Methods Interactive Grid Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Select Payment Mode</label>
                    <div className="grid grid-cols-2 gap-3.5">
                      {paymentMethodsList.map((item) => {
                        const isSelected = paymentMethod === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setPaymentMethod(item.id)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-300 ${
                              isSelected 
                                ? 'bg-[#141d38]/5 border-[#fcdb32] shadow-sm text-[#141d38]' 
                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                            }`}
                          >
                            <div className={`p-2 rounded-lg transition-colors ${isSelected ? 'bg-[#fcdb32] text-[#141d38]' : 'bg-white text-slate-400'}`}>
                              {item.icon}
                            </div>
                            <span className="text-xs font-bold leading-none">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Transaction Reference input */}
                  <div className="flex flex-col gap-1.5 pt-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Transaction ID / Reference Number</label>
                    <div className="relative flex items-center">
                      <CreditCard size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. TXN-12345678"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
                      />
                    </div>
                  </div>

                  {/* Policy Authorization Info Warning Card */}
                  <div className="flex items-start gap-2.5 p-4 bg-slate-100 rounded-xl border border-slate-200/50 text-[11px] text-[#141d38] font-medium leading-relaxed">
                    <Info size={16} className="shrink-0 mt-0.5 text-[#141d38]" />
                    <span>
                      By clicking submit, you authorize a secure premium transaction for <strong>₹{amount}</strong>. Once approved, your instant active policy certificate will be generated.
                    </span>
                  </div>

                  {/* Action submit button */}
                  <div className="pt-2">
                    <Button 
                      type="submit" 
                    >
                      <span>Pay & Issue Policy Certificate</span>
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;