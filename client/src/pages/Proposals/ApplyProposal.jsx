import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { submitProposal } from '../../services/proposalService';
import Loader from '../../components/loader';
import InsuranceCard from '../../components/InsuranceCard';
import { 
  ArrowLeft, 
  Check, 
  Info,
  Search
} from 'lucide-react';

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

  useEffect(() => {
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
      setError('Failed to fetch available insurance policies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySelect = (policy) => {
    setSelectedPolicy(policy);
    setSelectedAddOns([]); // Reset selected add-ons when policy changes
    setError('');
  };

  const handleAddOnToggle = (addOnId) => {
    if (selectedAddOns.includes(addOnId)) {
      setSelectedAddOns(selectedAddOns.filter(id => id !== addOnId));
    } else {
      setSelectedAddOns([...selectedAddOns, addOnId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPolicy) {
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

      setSuccess('Your insurance proposal has been submitted successfully! An officer will review your request.');
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
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          setError(data);
        } else if (data.errors) {
          setError(Object.values(data.errors).flat().join(', '));
        } else {
          setError(data.message || data.title || 'Failed to submit application. Please verify fields.');
        }
      } else {
        setError('Failed to submit application. Please verify fields.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate total estimated premium
  const calculateTotalPremium = () => {
    if (!selectedPolicy) return 0;
    let base = parseFloat(selectedPolicy.basePremium);
    
    // Add premium of selected addons
    const addonsPremium = selectedAddOns.reduce((sum, addOnId) => {
      const matched = selectedPolicy.policyAddOns?.find(pa => pa.addOnId === addOnId)?.addOn;
      return sum + (matched ? parseFloat(matched.additionalPremium) : 0);
    }, 0);

    return base + addonsPremium;
  };

  // Filter policies based on search query
  const filteredPolicies = policies.filter(p => 
    p.policyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.policyType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {(loading || submitting) && (
          <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center">
            <Loader />
          </div>
        )}

        {/* Header bar */}
        <header className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
          <button 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition duration-150"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <h2 className="text-xl font-bold text-slate-800">Apply for Vehicle Protection</h2>
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

        {!selectedPolicy ? (
          /* STEP 1: SELECT POLICY PLAN */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">Choose a Coverage Plan</h3>
              <p className="text-sm text-slate-500 mt-1">Select an active policy to begin filling your application</p>
            </div>
            
            {policies.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Info size={32} className="mx-auto mb-3" />
                <p className="text-sm">No insurance policies are currently offered by the system.</p>
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
                      className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                    />
                  </div>
                </div>

                {filteredPolicies.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 border border-dashed border-slate-200 rounded-xl">
                    <Info size={32} className="mx-auto mb-3 text-slate-400" />
                    <p className="text-sm">No insurance policies match your search query.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPolicies.map(p => (
                      <InsuranceCard 
                        key={p.policyId} 
                        policy={p} 
                        onSelect={handlePolicySelect} 
                        actionText="Select Plan"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* STEP 2: FILL VEHICLE DETAILS & SUBMIT */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-lg font-bold text-slate-800">Vehicle & Coverage Details</h3>
                <button 
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition duration-200"
                  onClick={() => setSelectedPolicy(null)}
                >
                  Change Plan
                </button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration Number</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. MH12AB1234"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle Manufacturer / Make</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Maruti Suzuki, Honda"
                    value={vehicleMake}
                    onChange={e => setVehicleMake(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle Model</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Swift, City"
                    value={vehicleModel}
                    onChange={e => setVehicleModel(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Manufacturing Year</label>
                  <input 
                    type="number" 
                    required 
                    min="1990" 
                    max={new Date().getFullYear() + 1}
                    value={vehicleYear}
                    onChange={e => setVehicleYear(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Engine Number</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. ENG12345678"
                    value={engineNumber}
                    onChange={e => setEngineNumber(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chassis Number</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. CHA12345678"
                    value={chassisNumber}
                    onChange={e => setChassisNumber(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                  />
                </div>

                {/* Add-ons Checklist */}
                {selectedPolicy.policyAddOns && selectedPolicy.policyAddOns.length > 0 && (
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Optional Benefit Covers</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedPolicy.policyAddOns.map(pa => (
                        <label key={pa.addOnId} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition duration-150 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={selectedAddOns.includes(pa.addOnId)}
                            onChange={() => handleAddOnToggle(pa.addOnId)}
                            className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800">{pa.addOn?.addOnName}</span>
                            <span className="text-xs font-medium text-blue-600 mt-0.5">Premium: +₹{pa.addOn?.additionalPremium}</span>
                            <span className="text-xs text-slate-400 mt-1">{pa.addOn?.description}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 pt-4">
                  <button 
                    type="submit" 
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 text-sm"
                  >
                    <Check size={16} />
                    <span>Submit Insurance Application</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Plan summary Sticky column */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-6">
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h3 className="text-base font-bold text-slate-800">Coverage Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 text-sm text-slate-600 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Selected Policy:</span>
                  <span className="text-slate-800 font-bold">{selectedPolicy.policyName}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm text-slate-600 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Policy Type:</span>
                  <span className="text-slate-800 font-semibold">{selectedPolicy.policyType}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm text-slate-600 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Base Premium:</span>
                  <span className="text-slate-800 font-semibold">₹{selectedPolicy.basePremium}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm text-slate-600 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Max Coverage Limit:</span>
                  <span className="text-slate-800 font-semibold">₹{selectedPolicy.coverageAmount}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm text-slate-600 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Duration Term:</span>
                  <span className="text-slate-800 font-semibold">{selectedPolicy.policyDurationMonths} Months</span>
                </div>
                
                {selectedAddOns.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Additional Add-ons:</h5>
                    <ul className="space-y-2">
                      {selectedAddOns.map(id => {
                        const name = selectedPolicy.policyAddOns?.find(pa => pa.addOnId === id)?.addOn?.addOnName;
                        const premium = selectedPolicy.policyAddOns?.find(pa => pa.addOnId === id)?.addOn?.additionalPremium;
                        return (
                          <li key={id} className="flex justify-between text-xs text-slate-600">
                            <span>{name}</span>
                            <span className="font-semibold text-slate-800">+ ₹{premium}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">Estimated Annual Premium:</span>
                  <span className="text-lg font-bold text-blue-600">₹{calculateTotalPremium()}</span>
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
