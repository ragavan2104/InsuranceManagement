import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fileClaim } from '../../services/claimService';
import { getMyProposalHistory } from '../../services/proposalService';
import Loader from '../../components/loader';
import Button from '../../components/Common/Button';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Check, 
  AlertCircle,
  ShieldAlert,
  FileText,
  Car
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FileClaim = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { issuedPolicyId, policyName, vehicleInfo } = location.state || {};

  const [activePolicies, setActivePolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState('');

  const [incidentDate, setIncidentDate] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [estimatedLossAmount, setEstimatedLossAmount] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!issuedPolicyId) {
      fetchActivePolicies();
    }
  }, [issuedPolicyId]);

  const fetchActivePolicies = async () => {
    try {
      setLoading(true);
      const proposals = await getMyProposalHistory();
      const active = proposals.filter(p => p.status === 'PolicyIssued' && p.issuedPolicyId);
      setActivePolicies(active);
      if (active.length > 0) {
        setSelectedPolicyId(active[0].issuedPolicyId.toString());
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch your active policies.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeId = issuedPolicyId || selectedPolicyId;
    if (!activeId) {
      toast.error('No active policy specified for this claim. Return to dashboard.');
      return;
    }

    const newErrors = {};
    if (!incidentDate) {
      newErrors.incidentDate = 'Incident date is required.';
    } else {
      const selectedDate = new Date(incidentDate);
      if (selectedDate > new Date()) {
        newErrors.incidentDate = 'Incident date cannot be in the future.';
      }
    }

    if (!estimatedLossAmount) {
      newErrors.estimatedLossAmount = 'Estimated financial damage is required.';
    } else {
      const lossAmount = parseFloat(estimatedLossAmount);
      if (isNaN(lossAmount) || lossAmount <= 0) {
        newErrors.estimatedLossAmount = 'Estimated loss amount must be a positive number.';
      }
    }

    if (!incidentDescription || !incidentDescription.trim()) {
      newErrors.incidentDescription = 'Incident description is required.';
    } else if (incidentDescription.length > 500) {
      newErrors.incidentDescription = 'Incident description cannot exceed 500 characters.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Client-side coverage limit validation
    let maxCoverage = 0;
    if (issuedPolicyId) {
      maxCoverage = parseFloat(location.state?.coverageAmount || 0);
    } else {
      const selectedPolicy = activePolicies.find(p => p.issuedPolicyId?.toString() === selectedPolicyId);
      maxCoverage = parseFloat(selectedPolicy?.finalInsuredDeclaredValue || 0);
    }

    const lossAmount = parseFloat(estimatedLossAmount);
    if (maxCoverage > 0 && lossAmount > maxCoverage) {
      toast.error(`Claim amount (Estimated Loss) cannot exceed the maximum policy coverage limit of ₹${maxCoverage.toLocaleString()}.`);
      return;
    }

    try {
      setLoading(true);

      const claimPayload = {
        issuedPolicyId: parseInt(activeId),
        incidentDate: new Date(incidentDate).toISOString(),
        incidentDescription,
        estimatedLossAmount: parseFloat(estimatedLossAmount)
      };

      await fileClaim(claimPayload);

      toast.success('Your insurance claim has been successfully registered! An adjuster will review it.');
      setIncidentDate('');
      setIncidentDescription('');
      setEstimatedLossAmount('');

      // Auto redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          toast.error(data);
        } else if (data.errors) {
          toast.error(Object.values(data.errors).flat().join(', '));
        } else {
          toast.error(data.error || data.message || data.title || 'Failed to file claim. Please check inputs.');
        }
      } else {
        toast.error('Connection to backend failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = issuedPolicyId || (activePolicies.length > 0);

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 relative font-sans">
      
      {/* Toast Notification Deck */}
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} />

      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center backdrop-blur-sm transition-all duration-300">
          <Loader />
        </div>
      )}

      <div className="max-w-xl mx-auto">
        
        {/* Header bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-8 gap-3">
          <button 
            className="flex items-center gap-2 text-slate-500 hover:text-[#141d38] text-sm font-bold transition-all duration-200 self-start group cursor-pointer" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-lg font-black text-[#141d38] tracking-tight uppercase flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#fcdb32]" />
            Register Claim
          </h2>
        </header>

        {!hasAccess ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#141d38] via-[#fcdb32] to-[#141d38]" />
            <AlertCircle size={40} className="text-rose-500 mx-auto mb-4 animate-pulse" />
            <p className="text-sm font-semibold text-[#141d38] mb-1">No Active Policies Found</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">You do not have any active insurance policies to file a claim against at this moment.</p>
            <button 
              className="bg-[#141d38] hover:bg-[#141d38]/95 text-[#fcdb32] text-xs font-bold py-2.5 px-5 rounded-xl transition duration-200 cursor-pointer shadow-md" 
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300">
            {/* Top decorative line highlight */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#141d38] via-[#fcdb32] to-[#141d38]" />

            <div className="border-b border-slate-100 pb-4 mb-6 pt-2">
              <h3 className="text-base font-extrabold text-[#141d38]">File Incident Report</h3>
              <p className="text-xs text-slate-400 mt-1">Provide the details of the loss incident to evaluate coverage</p>
            </div>

            {/* Policy Selector Dropdown (only visible when direct navigation) */}
            {!issuedPolicyId && activePolicies.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Select Covered Policy</label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-[#141d38] bg-slate-50/50 font-bold focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-xs"
                >
                  {activePolicies.map(p => (
                    <option key={p.proposalId} value={p.issuedPolicyId}>
                      {p.insurancePolicy?.policyName || 'Standard Policy'} - {p.vehicleMake} {p.vehicleModel} ({p.vehicleNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Policy Info Box */}
            <div className="bg-slate-50 rounded-xl p-5 mb-6 space-y-3.5 border border-slate-100/50 border-l-4 border-l-[#141d38]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Covered Policy:</span>
                <span className="text-[#141d38] font-black">
                  {issuedPolicyId 
                    ? (policyName || 'Standard Policy') 
                    : (activePolicies.find(p => p.issuedPolicyId?.toString() === selectedPolicyId)?.insurancePolicy?.policyName || 'N/A')
                  }
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Covered Vehicle:</span>
                <span className="text-slate-700 font-bold">
                  {issuedPolicyId 
                    ? (vehicleInfo || 'N/A') 
                    : (() => {
                        const current = activePolicies.find(p => p.issuedPolicyId?.toString() === selectedPolicyId);
                        return current ? `${current.vehicleMake} ${current.vehicleModel} (${current.vehicleNumber})` : 'N/A';
                      })()
                  }
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-200/50 pt-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Max Coverage Limit (IDV):</span>
                <span className="text-blue-600 font-black">
                  ₹{issuedPolicyId 
                    ? parseFloat(location.state?.coverageAmount || 0).toLocaleString() 
                    : parseFloat(activePolicies.find(p => p.issuedPolicyId?.toString() === selectedPolicyId)?.finalInsuredDeclaredValue || 0).toLocaleString()
                  }
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Incident Date Input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="incidentDate" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Incident Date</label>
                <div className="relative flex items-center">
                  <Calendar size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    id="incidentDate"
                    max={new Date().toISOString().split('T')[0]} // Cannot be in future
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-[#141d38] bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
                  />
                </div>
                {errors.incidentDate && (
                  <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    {errors.incidentDate}
                  </p>
                )}
              </div>

              {/* Estimated Loss Amount Input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="estimatedLossAmount" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Estimated Financial Damage (₹)</label>
                <div className="relative flex items-center">
                  <DollarSign size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    id="estimatedLossAmount"
                    min="1"
                    step="0.01"
                    placeholder="e.g. 15000.00"
                    value={estimatedLossAmount}
                    onChange={(e) => setEstimatedLossAmount(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-[#141d38] bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
                  />
                </div>
                {errors.estimatedLossAmount && (
                  <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    {errors.estimatedLossAmount}
                  </p>
                )}
              </div>

              {/* Incident Description Input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="incidentDescription" className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Incident Description / Damage Details</label>
                <textarea
                  id="incidentDescription"
                  rows="4"
                  maxLength="500"
                  placeholder="Explain exactly what happened, where it happened, and detail the damage on the vehicle..."
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-medium resize-none placeholder-slate-400"
                />
                {errors.incidentDescription && (
                  <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    {errors.incidentDescription}
                  </p>
                )}
              </div>

              {/* Action Submit */}
              <div className="pt-2">
                <Button type="submit">
                  <Check size={16} className="stroke-[2.5]" />
                  <span>Submit Claim Report</span>
                </Button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileClaim;