import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fileClaim } from '../../services/claimService';
import { getMyProposalHistory } from '../../services/proposalService';
import Loader from '../../components/loader';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Check, 
  AlertCircle 
} from 'lucide-react';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!issuedPolicyId) {
      fetchActivePolicies();
    }
  }, [issuedPolicyId]);

  const fetchActivePolicies = async () => {
    try {
      setLoading(true);
      setError('');
      const proposals = await getMyProposalHistory();
      const active = proposals.filter(p => p.status === 'PolicyIssued' && p.issuedPolicyId);
      setActivePolicies(active);
      if (active.length > 0) {
        setSelectedPolicyId(active[0].issuedPolicyId.toString());
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch your active policies.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeId = issuedPolicyId || selectedPolicyId;
    if (!activeId) {
      setError('No active policy specified for this claim. Return to dashboard.');
      return;
    }

    if (!incidentDate || !incidentDescription || !estimatedLossAmount) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const claimPayload = {
        issuedPolicyId: parseInt(activeId),
        incidentDate: new Date(incidentDate).toISOString(),
        incidentDescription,
        estimatedLossAmount: parseFloat(estimatedLossAmount)
      };

      await fileClaim(claimPayload);

      setSuccess('Your insurance claim has been successfully registered! An adjuster will review it.');
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
          setError(data);
        } else if (data.errors) {
          setError(Object.values(data.errors).flat().join(', '));
        } else {
          setError(data.error || data.message || data.title || 'Failed to file claim. Please check inputs.');
        }
      } else {
        setError('Connection to backend failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = issuedPolicyId || (activePolicies.length > 0);

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
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition duration-150 cursor-pointer" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-xl font-bold text-slate-800">Register Protection Claim</h2>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            <span>{success}</span>
          </div>
        )}

        {!hasAccess ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
            <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-5">You do not have any active insurance policies to file a claim against.</p>
            <button 
              className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-2.5 px-4 rounded-xl transition duration-200 text-xs cursor-pointer" 
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">File Incident Report</h3>
              <p className="text-sm text-slate-500 mt-1">Provide the details of the loss incident to evaluate coverage</p>
            </div>

            {/* Policy Selector Dropdown (only visible when direct navigation) */}
            {!issuedPolicyId && activePolicies.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Covered Policy</label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
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
            <div className="bg-slate-50 rounded-xl p-5 mb-6 space-y-3 border border-slate-100/50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Covered Policy:</span>
                <span className="text-slate-800 font-bold">
                  {issuedPolicyId 
                    ? (policyName || 'Standard Policy') 
                    : (activePolicies.find(p => p.issuedPolicyId?.toString() === selectedPolicyId)?.insurancePolicy?.policyName || 'N/A')
                  }
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Covered Vehicle:</span>
                <span className="text-slate-800 font-semibold">
                  {issuedPolicyId 
                    ? (vehicleInfo || 'N/A') 
                    : (() => {
                        const current = activePolicies.find(p => p.issuedPolicyId?.toString() === selectedPolicyId);
                        return current ? `${current.vehicleMake} ${current.vehicleModel} (${current.vehicleNumber})` : 'N/A';
                      })()
                  }
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="incidentDate" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incident Date</label>
                <div className="relative flex items-center">
                  <Calendar size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    id="incidentDate"
                    required
                    max={new Date().toISOString().split('T')[0]} // Cannot be in future
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="estimatedLossAmount" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Financial Damage (₹)</label>
                <div className="relative flex items-center">
                  <DollarSign size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    id="estimatedLossAmount"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 15000.00"
                    value={estimatedLossAmount}
                    onChange={(e) => setEstimatedLossAmount(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="incidentDescription" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Incident Description / Damage Details</label>
                <textarea
                  id="incidentDescription"
                  required
                  rows="4"
                  maxLength="500"
                  placeholder="Explain exactly what happened, where it happened, and detail the damage on the vehicle..."
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-sm cursor-pointer"
                >
                  <Check size={16} />
                  <span>Submit Claim Report</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileClaim;
