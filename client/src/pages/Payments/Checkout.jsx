import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { processCheckout } from '../../services/paymentService';
import Loader from '../../components/loader';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  Info 
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { proposalId, amount, policyName } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [transactionId, setTransactionId] = useState(`TXN-${Date.now().toString().substring(5)}`);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!proposalId) {
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
      setReceipt(result);
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          setError(data);
        } else if (data.errors) {
          setError(Object.values(data.errors).flat().join(', '));
        } else {
          setError(data.message || data.title || 'Transaction failed. Please try again.');
        }
      } else {
        setError('Transaction failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center">
          <Loader />
        </div>
      )}

      <div className="max-w-xl mx-auto">
        {/* Header bar */}
        <header className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
          <button 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition duration-150" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-xl font-bold text-slate-800">Premium Payment Checkout</h2>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            <span>{error}</span>
          </div>
        )}

        {receipt ? (
          /* PAYMENT SUCCESS RECEIPT SCREEN */
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Payment Successful!</h3>
            <p className="text-sm text-emerald-600 font-semibold mb-6">Your Policy is Now Active</p>
            
            <div className="bg-slate-50 rounded-xl p-5 mb-6 space-y-3 border border-slate-100/50 text-left">
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Policy Number:</span>
                <span className="font-bold text-blue-600">{receipt.policyNumber}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Amount Paid:</span>
                <span className="font-semibold text-slate-800">₹{receipt.amountPaid}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Transaction Reference:</span>
                <span className="font-medium text-slate-800">{receipt.transactionId}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Active Coverage Term:</span>
                <span className="font-medium text-slate-800">
                  {new Date(receipt.effectiveDate).toLocaleDateString()} to {new Date(receipt.expiryDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 text-sm" 
              onClick={() => navigate('/dashboard')}
            >
              Go to My Coverages
            </button>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">Confirm Premium Payment</h3>
              <p className="text-sm text-slate-500 mt-1">Enter payment details to authorize the activation of your insurance cover</p>
            </div>

            {!proposalId ? (
              <div className="text-center py-10 text-slate-500">
                <p className="text-sm">No proposal selected for checkout. Return to dashboard to select a plan.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Proposal Summary Box */}
                <div className="bg-slate-50 rounded-xl p-5 space-y-3 border border-slate-100/50">
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span>Insurance Plan:</span>
                    <span className="text-slate-800 font-bold">{policyName || 'Standard Policy'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span>Application Reference:</span>
                    <span className="text-slate-800 font-semibold">Proposal #{proposalId}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm font-bold text-slate-800">
                    <span>Annual Premium Due:</span>
                    <span className="text-blue-600 text-base">₹{amount}</span>
                  </div>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Payment Mode</label>
                    <select 
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                    >
                      <option value="Card">Credit / Debit Card</option>
                      <option value="UPI">UPI (Unified Payments Interface)</option>
                      <option value="NetBanking">Net Banking</option>
                      <option value="Wallet">Digital Wallet</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction ID / Reference Number</label>
                    <div className="relative flex items-center">
                      <CreditCard size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. TXN-12345678"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-4 bg-blue-50 rounded-xl border border-blue-100/40 text-xs text-blue-800 leading-relaxed">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    <span>Clicking submit will mock authorize a secure premium transaction for ₹{amount}. Once processed, your policy certificate will be issued immediately.</span>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 text-sm"
                    >
                      <span>Pay & Issue Policy Certificate</span>
                    </button>
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
