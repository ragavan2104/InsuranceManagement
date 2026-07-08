import React, { useState, useEffect } from 'react';
import { PlusCircle, RefreshCw, Slash, Info, AlertCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import API from '../../services/api';
import Loader from '../loader';
import InsuranceCard from '../InsuranceCard';
import Button from '../Common/Button';

const ManagePoliciesTab = () => {
  const [loading, setLoading] = useState(false);

  // Mode select state
  const [viewMode, setViewMode] = useState('templates'); // 'templates' | 'issued'

  // Policy Template states
  const [policiesList, setPoliciesList] = useState([]);
  const [addOnsList, setAddOnsList] = useState([]);
  const [showCreatePolicyForm, setShowCreatePolicyForm] = useState(false);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState(null);

  const [newPolicy, setNewPolicy] = useState({
    policyName: '',
    description: '',
    basePremium: '',
    coverageAmount: '',
    policyDurationMonths: 12,
    policyType: 'Comprehensive',
    categoryId: 1, // Default Two-Wheeler
    associatedAddOnIds: []
  });
  const [errors, setErrors] = useState({});

  // User Issued Policies states
  const [issuedPoliciesList, setIssuedPoliciesList] = useState([]);

  useEffect(() => {
    fetchPolicies();
    fetchAddOns();
    fetchIssuedPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await API.get('/Policy');
      setPoliciesList(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch policies.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddOns = async () => {
    try {
      const response = await API.get('/AddOn');
      setAddOnsList(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 404) {
        toast.error('Failed to fetch Add-ons.');
      } else {
        setAddOnsList([]);
      }
    }
  };

  const fetchIssuedPolicies = async () => {
    try {
      setLoading(true);
      const response = await API.get('/IssuedPolicy/all');
      setIssuedPoliciesList(response.data);
    } catch (err) {
      console.error(err);
      // Suppress alert if no records are found yet
      if (err.response?.status !== 404) {
        toast.error('Failed to fetch issued policies.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (policy) => {
    setIsEditing(true);
    setEditingPolicyId(policy.policyId);
    setNewPolicy({
      policyName: policy.policyName || '',
      description: policy.description || '',
      basePremium: policy.basePremium ? policy.basePremium.toString() : '',
      coverageAmount: policy.coverageAmount ? policy.coverageAmount.toString() : '',
      policyDurationMonths: policy.policyDurationMonths || 12,
      policyType: policy.policyType || 'Comprehensive',
      categoryId: policy.categoryId || 1,
      associatedAddOnIds: policy.associatedAddOns?.map(ao => ao.addOnId) || []
    });
    setShowCreatePolicyForm(true);
  };

  const handleCreateOrUpdatePolicy = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!newPolicy.policyName || !newPolicy.policyName.trim()) newErrors.policyName = 'Policy Name is required.';
    if (!newPolicy.basePremium) {
      newErrors.basePremium = 'Base Premium is required.';
    } else {
      const premium = parseFloat(newPolicy.basePremium);
      if (isNaN(premium) || premium < 0) {
        newErrors.basePremium = 'Base Premium must be a positive number.';
      }
    }
    if (!newPolicy.coverageAmount) {
      newErrors.coverageAmount = 'Coverage Amount is required.';
    } else {
      const coverage = parseFloat(newPolicy.coverageAmount);
      if (isNaN(coverage) || coverage < 0) {
        newErrors.coverageAmount = 'Coverage Amount must be a positive number.';
      }
    }
    if (!newPolicy.policyDurationMonths) {
      newErrors.policyDurationMonths = 'Duration is required.';
    } else {
      const duration = parseInt(newPolicy.policyDurationMonths);
      if (isNaN(duration) || duration < 1) {
        newErrors.policyDurationMonths = 'Duration must be at least 1 month.';
      }
    }
    if (!newPolicy.description || !newPolicy.description.trim()) newErrors.description = 'Policy Description is required.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        policyName: newPolicy.policyName,
        description: newPolicy.description,
        basePremium: parseFloat(newPolicy.basePremium),
        coverageAmount: parseFloat(newPolicy.coverageAmount),
        policyDurationMonths: parseInt(newPolicy.policyDurationMonths),
        policyType: newPolicy.policyType,
        categoryId: parseInt(newPolicy.categoryId),
        associatedAddOnIds: newPolicy.associatedAddOnIds.map(id => parseInt(id))
      };

      if (isEditing) {
        await API.put(`/Policy/UpdatePolicy/${editingPolicyId}`, payload);
        toast.success('Insurance policy updated successfully!');
      } else {
        await API.post('/Policy/AddPolicy', payload);
        toast.success('Insurance policy created successfully!');
      }

      setShowCreatePolicyForm(false);
      setIsEditing(false);
      setEditingPolicyId(null);
      setErrors({});
      setNewPolicy({
        policyName: '',
        description: '',
        basePremium: '',
        coverageAmount: '',
        policyDurationMonths: 12,
        policyType: 'Comprehensive',
        categoryId: 1,
        associatedAddOnIds: []
      });
      fetchPolicies();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        toast.error(typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data));
      } else {
        toast.error(isEditing ? 'Failed to update insurance policy.' : 'Failed to create insurance policy.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelIssuedPolicy = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this policy? This action is irreversible.')) return;
    try {
      setLoading(true);
      await API.post(`/IssuedPolicy/cancel/${id}`);
      toast.success(`Policy ID ${id} cancelled successfully.`);
      fetchIssuedPolicies();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel the policy.');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewIssuedPolicy = async (id) => {
    if (!window.confirm('Renew this policy? The expiration date will be extended.')) return;
    try {
      setLoading(true);
      await API.post(`/IssuedPolicy/renew/${id}`);
      toast.success(`Policy ID ${id} renewed successfully.`);
      fetchIssuedPolicies();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to renew the policy.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOnCheckboxChange = (addOnId) => {
    const isSelected = newPolicy.associatedAddOnIds.includes(addOnId);
    if (isSelected) {
      setNewPolicy({
        ...newPolicy,
        associatedAddOnIds: newPolicy.associatedAddOnIds.filter(id => id !== addOnId)
      });
    } else {
      setNewPolicy({
        ...newPolicy,
        associatedAddOnIds: [...newPolicy.associatedAddOnIds, addOnId]
      });
    }
  };

  return (
    <div className="space-y-6 min-h-screen p-8 bg-gray-50">
      <ToastContainer position="top-right" />

      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      {/* Mode Selector and Actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-bigstone/10 pb-5 gap-4">
        
        {/* Toggle Mode button group */}
        <div className="flex bg-bigstone/5 p-1.5 rounded-xl w-fit shadow-inner">
          <button 
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${viewMode === 'templates' ? 'bg-white text-bigstone shadow-sm scale-100' : 'text-bigstone/60 hover:text-bigstone hover:bg-white/50 scale-95'}`}
            onClick={() => { setViewMode('templates'); setShowCreatePolicyForm(false); }}
          >
            Policy Templates
          </button>
          <button 
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${viewMode === 'issued' ? 'bg-white text-bigstone shadow-sm scale-100' : 'text-bigstone/60 hover:text-bigstone hover:bg-white/50 scale-95'}`}
            onClick={() => { setViewMode('issued'); setShowCreatePolicyForm(false); }}
          >
            User Coverages
          </button>
        </div>

        {viewMode === 'templates' && !showCreatePolicyForm && (
          <button 
            className="flex items-center gap-2 bg-bigstone hover:bg-bigstone/90 text-brightsun font-semibold py-2.5 px-5 rounded-xl transition duration-200 text-sm w-fit shadow-sm hover:shadow-md hover:-translate-y-0.5"
            onClick={() => {
              setIsEditing(false);
              setNewPolicy({
                policyName: '',
                description: '',
                basePremium: '',
                coverageAmount: '',
                policyDurationMonths: 12,
                policyType: 'Comprehensive',
                categoryId: 1,
                associatedAddOnIds: []
              });
              setShowCreatePolicyForm(true);
            }}
          >
            <PlusCircle size={18} />
            <span>Create Policy</span>
          </button>
        )}
      </div>

      {/* Main Mode Rendering */}
      {viewMode === 'templates' ? (
        <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-300">
          {showCreatePolicyForm ? (
            <div className="bg-white rounded-2xl border border-bigstone/10 shadow-sm p-8 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-bigstone/5 pb-5 mb-6">
                <h3 className="text-xl font-bold text-bigstone">
                  {isEditing ? 'Update Insurance Policy' : 'Publish New Insurance Policy'}
                </h3>
                <button 
                  className="bg-bigstone/5 hover:bg-red-400 hover:text-white text-bigstone text-xs font-semibold py-2 px-4 rounded-lg transition duration-200" 
                  onClick={() => { setShowCreatePolicyForm(false); setIsEditing(false); }}
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handleCreateOrUpdatePolicy} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Policy Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Premium Auto Guard"
                    value={newPolicy.policyName} 
                    onChange={e => {
                      setNewPolicy({...newPolicy, policyName: e.target.value});
                      if (errors.policyName) setErrors({...errors, policyName: null});
                    }} 
                    className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm placeholder:text-bigstone/40"
                  />
                  {errors.policyName && (
                    <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {errors.policyName}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Policy Type</label>
                  <select 
                    value={newPolicy.policyType}
                    onChange={e => setNewPolicy({...newPolicy, policyType: e.target.value})}
                    className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm"
                  >
                    <option value="Comprehensive">Comprehensive</option>
                    <option value="Third-Party, Fire & Theft (TPFT)">Third-Party, Fire & Theft (TPFT)</option>
                    <option value="Third-Party Only (TPO)">Third-Party Only (TPO)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Base Premium (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="e.g. 5000.00"
                    value={newPolicy.basePremium} 
                    onChange={e => {
                      setNewPolicy({...newPolicy, basePremium: e.target.value});
                      if (errors.basePremium) setErrors({...errors, basePremium: null});
                    }} 
                    className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm placeholder:text-bigstone/40"
                  />
                  {errors.basePremium && (
                    <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {errors.basePremium}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Coverage Amount (Max Liability)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    placeholder="e.g. 150000.00"
                    value={newPolicy.coverageAmount} 
                    onChange={e => {
                      setNewPolicy({...newPolicy, coverageAmount: e.target.value});
                      if (errors.coverageAmount) setErrors({...errors, coverageAmount: null});
                    }} 
                    className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm placeholder:text-bigstone/40"
                  />
                  {errors.coverageAmount && (
                    <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {errors.coverageAmount}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Duration (Months)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newPolicy.policyDurationMonths} 
                    onChange={e => {
                      setNewPolicy({...newPolicy, policyDurationMonths: e.target.value});
                      if (errors.policyDurationMonths) setErrors({...errors, policyDurationMonths: null});
                    }} 
                    className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm"
                  />
                  {errors.policyDurationMonths && (
                    <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {errors.policyDurationMonths}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Vehicle Category ID</label>
                  <select 
                    value={newPolicy.categoryId}
                    onChange={e => setNewPolicy({...newPolicy, categoryId: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm"
                  >
                    <option value={1}>Two-Wheeler (ID: 1)</option>
                    <option value={2}>Four-Wheeler (ID: 2)</option>
                    <option value={3}>Commercial Vehicle (ID: 3)</option>
                  </select>
                </div>
                <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Policy Description</label>
                  <textarea 
                    rows="3"
                    maxLength="500"
                    placeholder="Summarize the coverage limits, exclusions, etc."
                    value={newPolicy.description} 
                    onChange={e => {
                      setNewPolicy({...newPolicy, description: e.target.value});
                      if (errors.description) setErrors({...errors, description: null});
                    }} 
                    className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm placeholder:text-bigstone/40 resize-none"
                  />
                  {errors.description && (
                    <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 lg:col-span-3 space-y-4 pt-2">
                  <label className="text-xs font-bold text-bigstone uppercase tracking-wider block border-b border-bigstone/5 pb-2">Select Associated Add-On Benefits</label>
                  {addOnsList.length === 0 ? (
                    <div className="p-4 bg-bigstone/5 rounded-xl border border-dashed border-bigstone/10 text-center">
                      <p className="text-sm font-medium text-bigstone/50">No active add-ons available.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {addOnsList.map(addon => {
                        const isSelected = newPolicy.associatedAddOnIds.includes(addon.addOnId);
                        return (
                          <label 
                            key={addon.addOnId} 
                            className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer 
                              ${isSelected 
                                ? 'bg-brightsun/10 border-brightsun shadow-sm ring-1 ring-brightsun/50' 
                                : 'bg-bigstone/5 border-transparent hover:bg-bigstone/10 hover:border-bigstone/20'
                              }`}
                          >
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleAddOnCheckboxChange(addon.addOnId)}
                              className="mt-1 w-4 h-4 rounded border-bigstone/30 text-brightsun focus:ring-brightsun/50 transition-colors cursor-pointer accent-bigstone"
                            />
                            <div className="flex flex-col">
                              <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-bigstone' : 'text-bigstone/80'}`}>{addon.addOnName}</span>
                              <span className={`text-xs font-bold mt-1 transition-colors ${isSelected ? 'text-bigstone/80' : 'text-bigstone/60'}`}>Premium: +₹{addon.additionalCost}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 lg:col-span-3 pt-6 border-t border-bigstone/5 flex justify-end">
                  <Button type="submit" className="w-full md:w-auto">
                    {isEditing ? 'Update Policy' : 'Publish Policy'}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="w-full">
              <div className="border-b border-bigstone/10 pb-4 mb-6">
                <h3 className="text-lg font-bold text-bigstone">Active Policies Directory</h3>
              </div>
              {policiesList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-bigstone/10 p-12 text-center">
                   <Info size={36} className="mx-auto mb-4 text-bigstone/30" />
                  <p className="text-base font-medium text-bigstone/70">No insurance policies published yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {policiesList.map(p => (
                    <InsuranceCard 
                      key={p.policyId} 
                      policy={p} 
                      onSelect={handleEditClick}
                      actionText="Edit Policy"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ISSUED COVERAGES VIEW */
        <div className="bg-white rounded-2xl border border-bigstone/10 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-6 border-b border-bigstone/5 bg-bigstone/[0.02]">
            <h3 className="text-lg font-bold text-bigstone">Active User Coverages Catalog</h3>
            <p className="text-sm text-bigstone/60 mt-1">Manage active coverages, extend terms, or process cancellations</p>
          </div>

          {issuedPoliciesList.length === 0 ? (
            <div className="p-16 text-center text-bigstone/60 bg-bigstone/[0.01]">
               <Info size={36} className="mx-auto mb-4 text-bigstone/30" />
               <p className="text-base font-medium text-bigstone/70">No active user policies have been issued by the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bigstone/5 border-b-2 border-bigstone/10 text-xs font-bold text-bigstone/70 uppercase tracking-wider">
                    <th className="py-4 px-6">Policy Number</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Policy Plan</th>
                    <th className="py-4 px-6">Start / End Dates</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bigstone/5">
                  {issuedPoliciesList.map(ip => (
                    <tr key={ip.issuedPolicyId} className="hover:bg-brightsun/10 transition-colors duration-200 group">
                      <td className="py-4 px-6 font-bold text-bigstone text-sm">{ip.policyNumber}</td>
                      <td className="py-4 px-6 text-sm text-bigstone/80">
                        <span className="font-bold text-bigstone block">{ip.user?.fullName || 'N/A'}</span>
                        <span className="text-[11px] text-bigstone/60 font-medium tracking-wide">{ip.user?.email || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-bigstone/80">
                        <span className="font-bold text-bigstone block">{ip.insurancePolicy?.policyName || 'Standard Policy'}</span>
                        <span className="text-[11px] text-bigstone/60 font-medium bg-bigstone/5 px-2 py-0.5 rounded-md inline-block mt-1">
                          Type: {ip.insurancePolicy?.policyType || 'Comprehensive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-bigstone/70">
                        <span className="block font-medium mb-1"><span className="text-bigstone/50 w-8 inline-block">Start:</span> {new Date(ip.startDate).toLocaleDateString()}</span>
                        <span className="block font-medium"><span className="text-bigstone/50 w-8 inline-block">End:</span> {new Date(ip.endDate).toLocaleDateString()}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-block px-3 py-1 text-[11px] font-bold rounded-full shadow-sm border ${
                          ip.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {ip.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {ip.status === 'Active' && (
                            <>
                              <button
                                onClick={() => handleRenewIssuedPolicy(ip.issuedPolicyId)}
                                className="flex items-center gap-1.5 bg-bigstone/5 hover:bg-emerald-50 text-bigstone hover:text-emerald-700 hover:border-emerald-200 border border-transparent font-bold py-1.5 px-3 rounded-lg text-xs transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
                                title="Renew / Extend Term"
                              >
                                <RefreshCw size={14} />
                                <span>Renew</span>
                              </button>
                              <button
                                onClick={() => handleCancelIssuedPolicy(ip.issuedPolicyId)}
                                className="flex items-center gap-1.5 bg-bigstone/5 hover:bg-rose-50 text-bigstone hover:text-rose-700 hover:border-rose-200 border border-transparent font-bold py-1.5 px-3 rounded-lg text-xs transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
                                title="Cancel Policy"
                              >
                                <Slash size={14} />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}
                          {ip.status === 'Cancelled' && (
                            <span className="text-xs font-bold text-bigstone/40 bg-bigstone/5 px-3 py-1.5 rounded-lg border border-dashed border-bigstone/10">Cancelled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagePoliciesTab;