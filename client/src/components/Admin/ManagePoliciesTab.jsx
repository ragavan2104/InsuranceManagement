import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../loader';
import { PlusCircle } from 'lucide-react';
import InsuranceCard from '../InsuranceCard';

const ManagePoliciesTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [policiesList, setPoliciesList] = useState([]);
  const [addOnsList, setAddOnsList] = useState([]);
  const [showCreatePolicyForm, setShowCreatePolicyForm] = useState(false);
  
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

  useEffect(() => {
    fetchPolicies();
    fetchAddOns();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/Policy');
      setPoliciesList(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch policies.');
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
        setError('Failed to fetch Add-ons.');
      } else {
        setAddOnsList([]);
      }
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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

      await API.post('/Policy/AddPolicy', payload);
      setSuccess('Insurance policy created successfully!');
      setShowCreatePolicyForm(false);
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
        setError(JSON.stringify(err.response.data));
      } else {
        setError('Failed to create insurance policy.');
      }
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
    <div className="space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center">
          <Loader />
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">Policies Catalog</h2>
        {!showCreatePolicyForm && (
          <button 
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
            onClick={() => setShowCreatePolicyForm(true)}
          >
            <PlusCircle size={16} />
            <span>Create Policy</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-sm font-medium">
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {showCreatePolicyForm ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">Publish New Insurance Policy</h3>
              <button 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition duration-200" 
                onClick={() => setShowCreatePolicyForm(false)}
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleCreatePolicy} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Premium Auto Guard"
                  value={newPolicy.policyName} 
                  onChange={e => setNewPolicy({...newPolicy, policyName: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy Type</label>
                <select 
                  value={newPolicy.policyType}
                  onChange={e => setNewPolicy({...newPolicy, policyType: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                >
                  <option value="Comprehensive">Comprehensive</option>
                  <option value="Third-Party, Fire & Theft (TPFT)">Third-Party, Fire & Theft (TPFT)</option>
                  <option value="Third-Party Only (TPO)">Third-Party Only (TPO)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Premium (₹)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  step="0.01"
                  placeholder="e.g. 5000.00"
                  value={newPolicy.basePremium} 
                  onChange={e => setNewPolicy({...newPolicy, basePremium: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Coverage Amount (Max Liability) (₹)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  step="0.01"
                  placeholder="e.g. 150000.00"
                  value={newPolicy.coverageAmount} 
                  onChange={e => setNewPolicy({...newPolicy, coverageAmount: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy Duration (Months)</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={newPolicy.policyDurationMonths} 
                  onChange={e => setNewPolicy({...newPolicy, policyDurationMonths: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle Category ID</label>
                <select 
                  value={newPolicy.categoryId}
                  onChange={e => setNewPolicy({...newPolicy, categoryId: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                >
                  <option value={1}>Two-Wheeler (ID: 1)</option>
                  <option value={2}>Four-Wheeler (ID: 2)</option>
                  <option value={3}>Commercial Vehicle (ID: 3)</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy Description</label>
                <textarea 
                  required 
                  rows="3"
                  maxLength="500"
                  placeholder="Summarize the coverage limits, exclusions, etc."
                  value={newPolicy.description} 
                  onChange={e => setNewPolicy({...newPolicy, description: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Select Associated Add-On Benefits</label>
                {addOnsList.length === 0 ? (
                  <p className="text-sm text-slate-400">No active add-ons available. Create add-ons in the Add-ons tab.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addOnsList.map(addon => (
                      <label key={addon.addOnId} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition duration-150 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={newPolicy.associatedAddOnIds.includes(addon.addOnId)}
                          onChange={() => handleAddOnCheckboxChange(addon.addOnId)}
                          className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800">{addon.addOnName}</span>
                          <span className="text-xs font-semibold text-blue-600 mt-0.5">Premium: +₹{addon.additionalPremium}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 lg:col-span-3 pt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 text-sm">
                  Publish Policy
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-base font-bold text-slate-800">Active Policies Directory</h3>
            </div>
            {policiesList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
                <p className="text-sm">No insurance policies published yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {policiesList.map(p => (
                  <InsuranceCard 
                    key={p.policyId} 
                    policy={p} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePoliciesTab;
