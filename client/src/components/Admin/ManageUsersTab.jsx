import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Hash, 
  Briefcase, 
  Info 
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '../Common/Button';
import API from '../../services/api';
import Loader from '../loader';

const ManageUsersTab = () => {
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    aadhaarNumber: '',
    panNumber: '',
    dateOfBirth: '',
    roleId: 3 // Default is User (3)
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalItems = usersList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = usersList.slice(startIndex, endIndex);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.get('/User');
      setUsersList(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch users list. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersProfile = async (userId) => {
    try {
      setLoading(true);
      const response = await API.get(`/User/${userId}`);
      setSelectedUser(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch user profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await API.post('/auth/register', {
        ...newUser,
        roleId: parseInt(newUser.roleId)
      });
      toast.success('User registered successfully!');
      setShowCreateUserForm(false);
      setNewUser({
        fullName: '',
        email: '',
        password: '',
        address: '',
        phone: '',
        aadhaarNumber: '',
        panNumber: '',
        dateOfBirth: '',
        roleId: 3
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          toast.error(data);
        } else if (data.errors) {
          toast.error(Object.values(data.errors).flat().join(', '));
        } else if (Array.isArray(data)) {
          toast.error(data.join(', '));
        } else {
          toast.error(data.message || data.title || 'Failed to register user.');
        }
      } else {
        toast.error('Failed to register user.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (roleId) => {
    if (roleId === 1) return 'bg-bigstone text-brightsun border-bigstone shadow-sm';
    if (roleId === 2) return 'bg-brightsun/30 text-bigstone border-brightsun/50';
    return 'bg-bigstone/5 text-bigstone/70 border-bigstone/10';
  };

  const getRoleName = (roleId) => {
    if (roleId === 1) return 'Admin';
    if (roleId === 2) return 'Officer';
    return 'User';
  };

  return (
    <div className="space-y-6 min-h-screen p-8 bg-bigstone/[0.02]">
      <ToastContainer position="top-right" />

      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center backdrop-blur-sm">
          <Loader />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-bigstone/10 pb-5 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-bigstone">Users Directory</h2>
          <p className="text-sm text-bigstone/60 mt-1">Manage system accounts, roles, and profiles</p>
        </div>
        {!showCreateUserForm && (
          <button 
            className="flex items-center gap-2 bg-bigstone hover:bg-bigstone/90 text-brightsun font-semibold py-2.5 px-5 rounded-xl transition duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 w-fit"
            onClick={() => setShowCreateUserForm(true)}
          >
            <PlusCircle size={18} />
            <span>Create User</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-300">
        {showCreateUserForm ? (
          <div className="bg-white rounded-2xl border border-bigstone/10 shadow-sm p-8 col-span-full transition-all duration-300">
            <div className="flex items-center justify-between border-b border-bigstone/5 pb-5 mb-6">
              <h3 className="text-xl font-bold text-bigstone">Register New System Account</h3>
              <button 
                className="bg-bigstone/5 hover:bg-bigstone/10 text-bigstone text-sm font-semibold py-2 px-4 rounded-lg transition duration-200" 
                onClick={() => setShowCreateUserForm(false)}
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={newUser.fullName} 
                  onChange={e => setNewUser({...newUser, fullName: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={newUser.email} 
                  onChange={e => setNewUser({...newUser, email: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  required 
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={newUser.phone} 
                  onChange={e => setNewUser({...newUser, phone: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Address</label>
                <input 
                  type="text" 
                  required 
                  value={newUser.address} 
                  onChange={e => setNewUser({...newUser, address: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Aadhaar Number</label>
                <input 
                  type="text" 
                  maxLength="12" 
                  required 
                  value={newUser.aadhaarNumber} 
                  onChange={e => setNewUser({...newUser, aadhaarNumber: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">PAN Card Number</label>
                <input 
                  type="text" 
                  maxLength="10" 
                  required 
                  value={newUser.panNumber} 
                  onChange={e => setNewUser({...newUser, panNumber: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm uppercase"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">Date of Birth</label>
                <input 
                  type="date" 
                  required 
                  value={newUser.dateOfBirth} 
                  onChange={e => setNewUser({...newUser, dateOfBirth: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5 lg:col-start-1">
                <label className="text-xs font-bold text-bigstone/70 uppercase tracking-wider">User Role</label>
                <select 
                  value={newUser.roleId} 
                  onChange={e => setNewUser({...newUser, roleId: e.target.value})}
                  className="w-full px-4 py-2.5 border border-bigstone/20 rounded-xl text-bigstone bg-bigstone/5 focus:bg-white focus:outline-none focus:border-brightsun focus:ring-4 focus:ring-brightsun/20 transition duration-200 text-sm font-semibold"
                >
                  <option value={3}>User (Customer)</option>
                  <option value={2}>Officer (Underwriter)</option>
                  <option value={1}>Administrator</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3 pt-6 border-t border-bigstone/5 flex justify-end mt-2">
                <Button type="submit" className="w-full md:w-auto bg-bigstone hover:bg-bigstone/90 text-brightsun font-bold py-3 px-8 rounded-xl transition duration-200 text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  Create User Profile
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Users List */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-bigstone/10 shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
              <div className="p-6 border-b border-bigstone/5 bg-bigstone/[0.02]">
                <h3 className="text-lg font-bold text-bigstone">Accounts Directory</h3>
              </div>
              <div className="overflow-x-auto w-full p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-bigstone/10">
                      <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-4 pt-2">Name</th>
                      <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-4 pt-2">Email</th>
                      <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-4 pt-2">Role</th>
                      <th className="text-xs font-bold text-bigstone/70 uppercase tracking-wider pb-4 px-4 pt-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bigstone/5">
                    {paginatedUsers.map(u => (
                      <tr key={u.userId} className={`hover:bg-brightsun/10 transition-colors duration-200 group ${selectedUser?.userId === u.userId ? 'bg-brightsun/10 shadow-inner' : ''}`}>
                        <td className="py-4 px-4 text-sm text-bigstone/80 align-middle">
                          <strong className="text-bigstone font-bold group-hover:text-bigstone transition-colors">{u.fullName}</strong>
                        </td>
                        <td className="py-4 px-4 text-sm text-bigstone/70 font-medium align-middle">
                          {u.email || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm align-middle">
                          <span className={`inline-block text-[10px] font-bold uppercase px-3 py-1 rounded-full border shadow-sm ${getRoleBadgeClass(u.roleId)}`}>
                            {getRoleName(u.roleId)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm align-middle text-right">
                          <button 
                            className={`inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 shadow-sm border
                              ${selectedUser?.userId === u.userId 
                                ? 'bg-bigstone text-brightsun border-bigstone' 
                                : 'bg-bigstone/5 text-bigstone hover:bg-brightsun hover:text-bigstone hover:border-brightsun/50 border-transparent'}`}
                            title="View Profile"
                            onClick={() => fetchUsersProfile(u.userId)}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-bigstone/10 p-4 gap-4 bg-bigstone/[0.01]">
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

            {/* Profile Details Panel */}
            <div className="xl:col-span-1 bg-white rounded-2xl border border-bigstone/10 shadow-sm p-6 h-fit sticky top-8 transition-all duration-300">
              {selectedUser ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-4 border-b border-bigstone/10 pb-6">
                    <div className="w-16 h-16 bg-brightsun text-bigstone rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-sm ring-4 ring-brightsun/20">
                      {selectedUser.fullName.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-lg font-bold text-bigstone truncate">{selectedUser.fullName}</h3>
                      <span className={`inline-block text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md border mt-1.5 shadow-sm ${getRoleBadgeClass(selectedUser.roleId)}`}>
                        {getRoleName(selectedUser.roleId)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-bigstone/5 transition-colors">
                      <div className="bg-bigstone/5 p-2 rounded-lg text-bigstone/50 mt-0.5 shrink-0">
                        <Mail size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-bigstone/50 uppercase tracking-wider block">Email Address</span>
                        <span className="text-sm font-bold text-bigstone block mt-0.5 break-all">{selectedUser.email || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-bigstone/5 transition-colors">
                      <div className="bg-bigstone/5 p-2 rounded-lg text-bigstone/50 mt-0.5 shrink-0">
                        <Phone size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-bigstone/50 uppercase tracking-wider block">Phone Number</span>
                        <span className="text-sm font-bold text-bigstone block mt-0.5">{selectedUser.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-bigstone/5 transition-colors">
                      <div className="bg-bigstone/5 p-2 rounded-lg text-bigstone/50 mt-0.5 shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-bigstone/50 uppercase tracking-wider block">Residential Address</span>
                        <span className="text-sm font-bold text-bigstone block mt-0.5 leading-relaxed">{selectedUser.address}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-bigstone/5 transition-colors">
                      <div className="bg-bigstone/5 p-2 rounded-lg text-bigstone/50 mt-0.5 shrink-0">
                         <Calendar size={16} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-bigstone/50 uppercase tracking-wider block">Date of Birth & Age</span>
                        <span className="text-sm font-bold text-bigstone block mt-0.5">
                          {new Date(selectedUser.dateOfBirth).toLocaleDateString('en-IN')} 
                          <span className="text-bigstone/60 ml-2 font-semibold">({selectedUser.age} yrs)</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-bigstone/5 border border-bigstone/5">
                        <div className="text-bigstone/50 shrink-0 mt-0.5">
                           <Hash size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-bigstone/50 uppercase tracking-wider block">Aadhaar No.</span>
                          <span className="text-xs font-bold text-bigstone block mt-1 tracking-wide">{selectedUser.aadhaarNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-bigstone/5 border border-bigstone/5">
                        <div className="text-bigstone/50 shrink-0 mt-0.5">
                          <Briefcase size={16} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-bigstone/50 uppercase tracking-wider block">PAN No.</span>
                          <span className="text-xs font-bold text-bigstone block mt-1 uppercase tracking-wide">{selectedUser.panNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-bigstone/[0.02] rounded-xl border border-dashed border-bigstone/10 h-full flex flex-col items-center justify-center">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <Info size={32} className="text-bigstone/30" />
                  </div>
                  <h4 className="text-base font-bold text-bigstone/80 mb-2">No Profile Selected</h4>
                  <p className="text-sm text-bigstone/60 font-medium max-w-[200px] mx-auto">
                    Select a user from the directory table to view their full profile details.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageUsersTab;