import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  Info,
  Search,
  Briefcase,
  Shield,
  Car,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

// Real backend services & component imports
import API from '../../services/api';
import { submitProposal } from '../../services/proposalService';
import Loader from '../../components/loader';
import InsuranceCard from '../../components/InsuranceCard';
import Button from '../../components/Common/Button';

const ApplyProposal = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields State
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState(new Date().getFullYear());
  const [engineNumber, setEngineNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  // Safely inject Toastify CSS dynamically via CDN link to avoid bundler compile blocks inside Canvas
  useEffect(() => {
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/Policy');
      setPolicies(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch available insurance policies.');
      setError('Failed to fetch available insurance policies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySelect = (policy) => {
    setSelectedPolicy(policy);
    setSelectedAddOns([]); // Reset selected add-ons when policy changes
    setError('');
    toast.success(`You selected: ${policy.policyName}. Fill your vehicle parameters to proceed!`);
  };

  const handleAddOnToggle = (addOnId) => {
    if (selectedAddOns.includes(addOnId)) {
      setSelectedAddOns(selectedAddOns.filter(id => id !== addOnId));
      toast.info('Add-on coverage removed.');
    } else {
      setSelectedAddOns([...selectedAddOns, addOnId]);
      toast.success('Add-on coverage added to proposal.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPolicy) {
      toast.error('Please select an insurance policy.');
      setError('Please select an insurance policy.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const proposalPayload = {
        policyId: selectedPolicy.policyId,
        vehicleNumber,
        vehicleMake,
        vehicleModel,
        vehicleYear: parseInt(vehicleYear),
        engineNumber,
        chassisNumber,
        selectedAddOnIds: selectedAddOns.map(id => parseInt(id))
      };

      await submitProposal(proposalPayload);

      const msg = 'Your insurance proposal has been submitted successfully! An officer will review your request.';
      setSuccess(msg);
      toast.success(msg);
      
      // Clear Form
      setVehicleNumber('');
      setVehicleMake('');
      setVehicleModel('');
      setVehicleYear(new Date().getFullYear());
      setEngineNumber('');
      setChassisNumber('');
      setSelectedAddOns([]);
      
      // Auto redirect after delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to submit application. Please verify fields.';
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
      setSubmitting(false);
    }
  };

  // Calculate total estimated premium
  const calculateTotalPremium = () => {
    if (!selectedPolicy) return 0;
    
    // Safely parse numbers from basePremium string
    const baseValue = typeof selectedPolicy.basePremium === 'string'
      ? parseFloat(selectedPolicy.basePremium.replace(/,/g, ''))
      : parseFloat(selectedPolicy.basePremium || 0);

    // Add premium of selected addons
    const addonsPremium = selectedAddOns.reduce((sum, addOnId) => {
      const matched = selectedPolicy.associatedAddOns?.find(ao => ao.addOnId === addOnId);
      if (matched) {
        const costValue = typeof matched.additionalCost === 'string'
          ? parseFloat(matched.additionalCost.replace(/,/g, ''))
          : parseFloat(matched.additionalCost || 0);
        return sum + costValue;
      }
      return sum;
    }, 0);

    return (baseValue + addonsPremium).toLocaleString();
  };

  // Filter policies based on search query
  const filteredPolicies = policies.filter(p => 
    p.policyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.policyType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 relative">
      
      {/* Toast Notification Deck */}
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} />

      {(loading || submitting) && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center backdrop-blur-sm transition-all duration-300">
          <Loader />
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        
        {/* Header bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-8 gap-3">
          <button 
            className="flex items-center gap-2 text-slate-500 hover:text-[#141d38] text-sm font-bold transition-all duration-200 self-start group"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-lg font-black text-[#141d38] tracking-tight uppercase flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#fcdb32]" />
            Apply for Vehicle Protection
          </h2>
        </header>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2">
            <Info size={16} className="text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2 animate-pulse">
            <Check size={16} className="text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {!selectedPolicy ? (
          /* STEP 1: SELECT POLICY PLAN */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
            {/* Top decorative line highlight */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#141d38] via-[#fcdb32] to-[#141d38]" />

            <div className="border-b border-slate-100 pb-4 mb-6 pt-2">
              <h3 className="text-base font-extrabold text-[#141d38]">Choose a Coverage Plan</h3>
              <p className="text-xs text-slate-400 mt-1">Select an active policy parameters program to begin your submission application.</p>
            </div>
            
            {policies.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-4">
                <div className="inline-flex p-4 bg-slate-50 rounded-full text-slate-300">
                  <Shield size={36} className="stroke-1" />
                </div>
                <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">No insurance policies are currently offered by the system.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="relative flex items-center">
                    <Search size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input 
                      type="text" 
                      placeholder="Search insurance by name, type, or description..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
                    />
                  </div>
                </div>

                {filteredPolicies.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-xl space-y-3">
                    <Info size={32} className="mx-auto text-slate-300" />
                    <p className="text-sm font-medium">No insurance policies match your search query.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPolicies.map(p => (
                      <InsuranceCard 
                        key={p.policyId} 
                        policy={p} 
                        onSelect={handlePolicySelect} 
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* STEP 2: FILL VEHICLE DETAILS & SUBMIT */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-300">
            
            {/* Form Column */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 relative">
              {/* Top decorative line highlight */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#141d38] via-[#fcdb32] to-[#141d38]" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 pt-2 gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#141d38]">Vehicle & Coverage Parameters</h3>
                  <p className="text-xs text-slate-400 mt-1">Please fill up precise vehicle parameters matching your motor registration book.</p>
                </div>
                <button 
                  className="bg-slate-100 hover:bg-[#141d38] text-slate-700 hover:text-[#fcdb32] text-xs font-bold py-2 px-3.5 rounded-lg transition-all duration-200 self-start"
                  onClick={() => setSelectedPolicy(null)}
                >
                  Change Plan
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Registration Number</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. MH12AB1234"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Vehicle Manufacturer / Make</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Maruti Suzuki, Honda"
                    value={vehicleMake}
                    onChange={e => setVehicleMake(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Vehicle Model</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Swift, City"
                    value={vehicleModel}
                    onChange={e => setVehicleModel(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Manufacturing Year</label>
                  <input 
                    type="number" 
                    required 
                    min="1990" 
                    max={new Date().getFullYear() + 1}
                    value={vehicleYear}
                    onChange={e => setVehicleYear(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Engine Number</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. ENG12345678"
                    value={engineNumber}
                    onChange={e => setEngineNumber(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Chassis Number</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. CHA12345678"
                    value={chassisNumber}
                    onChange={e => setChassisNumber(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
                  />
                </div>

                {/* Add-ons Checklist */}
                {selectedPolicy.associatedAddOns && selectedPolicy.associatedAddOns.length > 0 && (
                  <div className="md:col-span-2 space-y-3 pt-3">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Add-On Coverages (Optional)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedPolicy.associatedAddOns.map(ao => {
                        const isChecked = selectedAddOns.includes(ao.addOnId);
                        return (
                          <label 
                            key={ao.addOnId} 
                            className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                              isChecked 
                                ? 'bg-[#141d38]/5 border-[#fcdb32] shadow-sm' 
                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleAddOnToggle(ao.addOnId)}
                              className="mt-1 rounded border-slate-300 text-[#141d38] focus:ring-[#fcdb32] w-4 h-4 cursor-pointer"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#141d38]">{ao.addOnName}</span>
                              <span className="text-[11px] font-extrabold text-emerald-600 mt-1">Premium: +₹{ao.additionalCost}</span>
                              <span className="text-[10px] text-slate-400 mt-1 leading-relaxed">{ao.description}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 pt-4">
                  <Button 
                    type="submit" 
                  >
                    <span>Submit Insurance Application</span>
                  </Button>
                </div>
              </form>
            </div>

            {/* Plan summary Sticky column */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-6 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#fcdb32]" />
              
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Briefcase size={14} className="text-[#141d38]" />
                  <span>Coverage Summary</span>
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 text-xs text-slate-600 border-b border-slate-50">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Selected Policy:</span>
                  <span className="text-[#141d38] font-black">{selectedPolicy.policyName}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-xs text-slate-600 border-b border-slate-50">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Policy Type:</span>
                  <span className="text-slate-800 font-extrabold">{selectedPolicy.policyType}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-xs text-slate-600 border-b border-slate-50">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Base Premium:</span>
                  <span className="text-[#141d38] font-extrabold">₹{selectedPolicy.basePremium}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-xs text-slate-600 border-b border-slate-50">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Max Coverage Limit:</span>
                  <span className="text-slate-800 font-extrabold">₹{selectedPolicy.coverageAmount}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-xs text-slate-600 border-b border-slate-50">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Duration Term:</span>
                  <span className="text-slate-800 font-extrabold">{selectedPolicy.policyDurationMonths} Months</span>
                </div>
                
                {selectedAddOns.length > 0 && (
                  <div className="bg-[#141d38]/5 rounded-xl p-4 space-y-2.5 border border-slate-100/50">
                    <h5 className="text-[10px] font-extrabold text-[#141d38] uppercase tracking-wider">Additional Add-ons:</h5>
                    <ul className="space-y-2">
                      {selectedAddOns.map(id => {
                        const name = selectedPolicy.associatedAddOns?.find(ao => ao.addOnId === id)?.addOnName;
                        const premium = selectedPolicy.associatedAddOns?.find(ao => ao.addOnId === id)?.additionalCost;
                        return (
                          <li key={id} className="flex justify-between text-xs text-slate-600">
                            <span className="font-semibold">{name}</span>
                            <span className="font-bold text-[#141d38]">+ ₹{premium}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 pt-4 mt-4 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Estimated Annual Premium:</span>
                  <span className="text-2xl font-black text-emerald-600">₹{calculateTotalPremium()}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyProposal;