import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../loader';
import { PlusCircle } from 'lucide-react';

const ManageAddOnsTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [addOnsList, setAddOnsList] = useState([]);
  const [showCreateAddOnForm, setShowCreateAddOnForm] = useState(false);
  
  const [newAddOn, setNewAddOn] = useState({
    addOnName: '',
    description: '',
    additionalPremium: '',
    isActive: true
  });

  useEffect(() => {
    fetchAddOns();
  }, []);

  const fetchAddOns = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/AddOn');
      setAddOnsList(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 404) {
        setError('Failed to fetch Add-ons.');
      } else {
        setAddOnsList([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddOn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const payload = {
        addOnName: newAddOn.addOnName,
        description: newAddOn.description,
        additionalPremium: parseFloat(newAddOn.additionalPremium),
        isActive: true
      };

      await API.post('/AddOn/AddAddOn', payload);
      setSuccess('Add-on benefit created successfully!');
      setShowCreateAddOnForm(false);
      setNewAddOn({
        addOnName: '',
        description: '',
        additionalPremium: '',
        isActive: true
      });
      fetchAddOns();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError('Failed to create add-on.');
      }
    } finally {
      setLoading(false);
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
        <h2 className="text-xl font-bold text-slate-800">Add-On Benefits</h2>
        {!showCreateAddOnForm && (
          <button 
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
            onClick={() => setShowCreateAddOnForm(true)}
          >
            <PlusCircle size={16} />
            <span>Create Add-On</span>
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
        {showCreateAddOnForm ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">Define Add-On Benefit</h3>
              <button 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition duration-200" 
                onClick={() => setShowCreateAddOnForm(false)}
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleCreateAddOn} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add-On Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Zero Depreciation Cover"
                  value={newAddOn.addOnName} 
                  onChange={e => setNewAddOn({...newAddOn, addOnName: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Additional Premium (₹)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  step="0.01"
                  placeholder="e.g. 750.00"
                  value={newAddOn.additionalPremium} 
                  onChange={e => setNewAddOn({...newAddOn, additionalPremium: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add-On Description</label>
                <textarea 
                  required 
                  rows="3"
                  placeholder="Describe what protection this add-on provides..."
                  value={newAddOn.description} 
                  onChange={e => setNewAddOn({...newAddOn, description: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 text-sm">
                  Publish Add-On
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="border-b border-slate-50 pb-4 mb-4">
              <h3 className="text-base font-bold text-slate-800">Active Benefit Add-Ons</h3>
            </div>
            {addOnsList.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p className="text-sm">No benefit add-ons defined yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Add-On Name</th>
                      <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Additional Premium</th>
                      <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {addOnsList.map(a => (
                      <tr key={a.addOnId} className="hover:bg-slate-50/40 transition duration-150">
                        <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                          <strong className="text-slate-800 font-semibold">{a.addOnName}</strong>
                        </td>
                        <td className="py-4 text-sm text-slate-700 font-semibold border-b border-slate-50 align-middle">
                          + ₹{a.additionalPremium}
                        </td>
                        <td className="py-4 text-sm text-slate-500 border-b border-slate-50 align-middle max-w-sm">
                          {a.description}
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
    </div>
  );
};

export default ManageAddOnsTab;
