import React, { useState, useEffect } from 'react';
import { PlusCircle, Info, Edit } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '../Common/Button';
import API from '../../services/api';
import Loader from '../loader';

const ManageAddOnsTab = () => {
  const [loading, setLoading] = useState(false);
  const [addOnsList, setAddOnsList] = useState([]);
  const [showCreateAddOnForm, setShowCreateAddOnForm] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  const [newAddOn, setNewAddOn] = useState({
    addOnName: '',
    description: '',
    additionalCost: '',
    isActive: true
  });

  useEffect(() => {
    fetchAddOns();
  }, []);

  const totalItems = addOnsList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAddOns = addOnsList.slice(startIndex, endIndex);

  const fetchAddOns = async () => {
    try {
      setLoading(true);
      const response = await API.get('/AddOn');
      setAddOnsList(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 404) {
        toast.error('Failed to fetch Add-ons.');
      } else {
        setAddOnsList([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddOn = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const payload = {
        addOnName: newAddOn.addOnName,
        description: newAddOn.description,
        additionalCost: parseFloat(newAddOn.additionalCost),
        isActive: true
      };

      await API.post('/AddOn/AddAddOn', payload);
      toast.success('Add-on benefit created successfully!');
      setShowCreateAddOnForm(false);
      setNewAddOn({
        addOnName: '',
        description: '',
        additionalCost: '',
        isActive: true
      });
      fetchAddOns();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        toast.error(typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data));
      } else {
        toast.error('Failed to create add-on.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddOn = async (e) => {
    e.preventDefault();
    if (!editingAddOn) return;

    try {
      setLoading(true);
      const payload = {
        addOnName: editingAddOn.addOnName,
        description: editingAddOn.description,
        additionalCost: parseFloat(editingAddOn.additionalCost),
        isActive: editingAddOn.isActive
      };

      await API.put(`/AddOn/UpdateAddOn/${editingAddOn.addOnId}`, payload);
      toast.success('Add-on benefit updated successfully!');
      setEditingAddOn(null);
      fetchAddOns();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        toast.error(typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data));
      } else {
        toast.error('Failed to update add-on.');
      }
    } finally {
      setLoading(false);
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

      <div className="flex items-center justify-between border-b border-bigstone/10 pb-5 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-bigstone">Add-On Benefits</h2>
          <p className="text-sm text-bigstone/60 mt-1">Manage and configure additional coverage options</p>
        </div>
        {!showCreateAddOnForm && !editingAddOn && (
          <button 
            className="flex items-center gap-2 bg-bigstone hover:bg-bigstone/90 text-brightsun font-semibold py-2.5 px-5 rounded-xl transition duration-200 shadow-sm hover:shadow-md cursor-pointer"
            onClick={() => setShowCreateAddOnForm(true)}
          >
            <PlusCircle size={18} />
            <span>Create Add-On</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {editingAddOn ? (
          <div className="bg-white rounded-2xl border border-bigstone/10 shadow-sm p-8 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-bigstone/5 pb-5 mb-6">
              <h3 className="text-lg font-bold text-bigstone">Update Add-On Benefit</h3>
              <button 
                className="bg-bigstone/5 hover:bg-bigstone/10 text-bigstone text-sm font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer" 
                onClick={() => setEditingAddOn(null)}
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleUpdateAddOn} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Add-On Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Zero Depreciation Cover"
                  value={editingAddOn.addOnName} 
                  onChange={e => setEditingAddOn({...editingAddOn, addOnName: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm placeholder:text-bigstone/40"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Additional Premium (₹)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  step="0.01"
                  placeholder="e.g. 750.00"
                  value={editingAddOn.additionalCost} 
                  onChange={e => setEditingAddOn({...editingAddOn, additionalCost: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm placeholder:text-bigstone/40"
                />
              </div>
              
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Add-On Description</label>
                <textarea 
                  required 
                  rows="3"
                  placeholder="Describe what protection this add-on provides..."
                  value={editingAddOn.description} 
                  onChange={e => setEditingAddOn({...editingAddOn, description: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm placeholder:text-bigstone/40 resize-none"
                />
              </div>
              
              <div className="md:col-span-2 pt-4 border-t border-bigstone/5">
                <Button type="submit" className="w-full md:w-auto md:min-w-[200px] float-right ">
                  Update Add-On
                </Button>
              </div>
            </form>
          </div>
        ) : showCreateAddOnForm ? (
          <div className="bg-white rounded-2xl border border-bigstone/10 shadow-sm p-8 transition-all duration-300">
            <div className="flex items-center justify-between border-b border-bigstone/5 pb-5 mb-6">
              <h3 className="text-lg font-bold text-bigstone">Define Add-On Benefit</h3>
              <button 
                className="bg-bigstone/5 hover:bg-bigstone/10 text-bigstone text-sm font-semibold py-2 px-4 rounded-lg transition duration-200 cursor-pointer" 
                onClick={() => setShowCreateAddOnForm(false)}
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleCreateAddOn} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Add-On Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Zero Depreciation Cover"
                  value={newAddOn.addOnName} 
                  onChange={e => setNewAddOn({...newAddOn, addOnName: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm placeholder:text-bigstone/40"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Additional Premium (₹)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  step="0.01"
                  placeholder="e.g. 750.00"
                  value={newAddOn.additionalCost} 
                  onChange={e => setNewAddOn({...newAddOn, additionalCost: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm placeholder:text-bigstone/40"
                />
              </div>
              
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Add-On Description</label>
                <textarea 
                  required 
                  rows="3"
                  placeholder="Describe what protection this add-on provides..."
                  value={newAddOn.description} 
                  onChange={e => setNewAddOn({...newAddOn, description: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm placeholder:text-bigstone/40 resize-none"
                />
              </div>
              
              <div className="md:col-span-2 pt-4 border-t border-bigstone/5">
                <Button type="submit" className="w-full md:w-auto md:min-w-[200px] float-right">
                  Publish Add-On
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-bigstone/10 shadow-sm p-6 transition-all duration-300 hover:shadow-md">
            <div className="border-b border-bigstone/5 pb-5 mb-5">
              <h3 className="text-lg font-bold text-bigstone">Active Benefit Add-Ons</h3>
            </div>
            
            {addOnsList.length === 0 ? (
              <div className="text-center py-16 text-bigstone/60 bg-bigstone/[0.02] rounded-xl border border-dashed border-bigstone/10">
                <Info size={36} className="mx-auto mb-4 text-bigstone/30" />
                <p className="text-base font-medium text-bigstone/70">No benefit add-ons defined yet.</p>
                <p className="text-sm mt-1">Click the button above to create your first add-on.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-bigstone/10">
                      <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-3 w-1/4">Add-On Name</th>
                      <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-3 w-1/5">Additional Premium</th>
                      <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-3 w-2/5">Description</th>
                      <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bigstone/5">
                    {paginatedAddOns.map(a => (
                      <tr key={a.addOnId} className="hover:bg-brightsun/10 transition-colors duration-200 group">
                        <td className="py-4 px-3 text-sm text-bigstone/80 align-middle">
                          <strong className="text-bigstone font-bold group-hover:text-bigstone transition-colors">{a.addOnName}</strong>
                        </td>
                        <td className="py-4 px-3 text-sm text-bigstone font-bold align-middle">
                          <span className="bg-brightsun/20 text-bigstone px-2.5 py-1 rounded-md">
                            + ₹{parseFloat(a.additionalCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-sm text-bigstone/70 align-middle leading-relaxed">
                          {a.description}
                        </td>
                        <td className="py-4 px-3 text-sm text-bigstone/80 align-middle text-right">
                          <button
                            className="inline-flex items-center gap-1.5 bg-bigstone/5 hover:bg-brightsun hover:text-bigstone text-bigstone text-xs font-bold py-1.5 px-3.5 rounded-lg transition-all duration-200 active:scale-[0.96] cursor-pointer"
                            onClick={() => setEditingAddOn(a)}
                            title="Edit Add-On Details"
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-bigstone/10 pt-5 mt-5 gap-4">
                <div className="text-xs font-bold text-bigstone/60 uppercase tracking-wider">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-xl border border-bigstone/20 text-xs font-bold text-bigstone bg-white hover:bg-bigstone/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition duration-200"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                        currentPage === page
                          ? 'bg-bigstone text-brightsun shadow-md'
                          : 'border border-bigstone/20 text-bigstone bg-white hover:bg-bigstone/5'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 rounded-xl border border-bigstone/20 text-xs font-bold text-bigstone bg-white hover:bg-bigstone/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAddOnsTab;