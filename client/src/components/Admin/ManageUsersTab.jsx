import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../loader';
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

const ManageUsersTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/User');
      setUsersList(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users list. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersProfile = async (userId) => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get(`/User/${userId}`);
      setSelectedUser(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch user profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      await API.post('/auth/register', {
        ...newUser,
        roleId: parseInt(newUser.roleId)
      });
      setSuccess('User registered successfully!');
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
          setError(data);
        } else if (data.errors) {
          setError(Object.values(data.errors).flat().join(', '));
        } else if (Array.isArray(data)) {
          setError(data.join(', '));
        } else {
          setError(data.message || data.title || 'Failed to register user.');
        }
      } else {
        setError('Failed to register user.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (roleId) => {
    if (roleId === 1) return 'bg-purple-50 text-purple-600 border-purple-100';
    if (roleId === 2) return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const getRoleName = (roleId) => {
    if (roleId === 1) return 'Admin';
    if (roleId === 2) return 'Officer';
    return 'User';
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center">
          <Loader />
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">Users Directory</h2>
        {!showCreateUserForm && (
          <button 
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-sm"
            onClick={() => setShowCreateUserForm(true)}
          >
            <PlusCircle size={16} />
            <span>Create User</span>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {showCreateUserForm ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 col-span-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-800">Register New System Account</h3>
              <button 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition duration-200" 
                onClick={() => setShowCreateUserForm(false)}
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={newUser.fullName} 
                  onChange={e => setNewUser({...newUser, fullName: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={newUser.email} 
                  onChange={e => setNewUser({...newUser, email: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  required 
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={newUser.phone} 
                  onChange={e => setNewUser({...newUser, phone: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</label>
                <input 
                  type="text" 
                  required 
                  value={newUser.address} 
                  onChange={e => setNewUser({...newUser, address: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aadhaar Number</label>
                <input 
                  type="text" 
                  maxLength="12" 
                  required 
                  value={newUser.aadhaarNumber} 
                  onChange={e => setNewUser({...newUser, aadhaarNumber: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PAN Card Number</label>
                <input 
                  type="text" 
                  maxLength="10" 
                  required 
                  value={newUser.panNumber} 
                  onChange={e => setNewUser({...newUser, panNumber: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                <input 
                  type="date" 
                  required 
                  value={newUser.dateOfBirth} 
                  onChange={e => setNewUser({...newUser, dateOfBirth: e.target.value})} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">User Role</label>
                <select 
                  value={newUser.roleId} 
                  onChange={e => setNewUser({...newUser, roleId: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                >
                  <option value={3}>User (Customer)</option>
                  <option value={2}>Officer (Underwriter)</option>
                  <option value={1}>Administrator</option>
                </select>
              </div>
              <div className="md:col-span-2 lg:col-span-3 pt-4">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 text-sm">
                  Create User Profile
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Users List */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="border-b border-slate-50 pb-4 mb-4">
                <h3 className="text-base font-bold text-slate-800">Accounts Directory</h3>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Name</th>
                      <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Email</th>
                      <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Role</th>
                      <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.userId} className={`hover:bg-slate-50/40 transition duration-150 ${selectedUser?.userId === u.userId ? 'bg-blue-50/30' : ''}`}>
                        <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                          <strong className="text-slate-800 font-semibold">{u.fullName}</strong>
                        </td>
                        <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                          {u.email || 'N/A'}
                        </td>
                        <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                          <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getRoleBadgeClass(u.roleId)}`}>
                            {getRoleName(u.roleId)}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle text-right">
                          <button 
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition duration-150" 
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
            </div>

            {/* Profile Details Panel */}
            <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-fit">
              {selectedUser ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0">
                      {selectedUser.fullName.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-base font-bold text-slate-800 truncate">{selectedUser.fullName}</h3>
                      <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded border mt-1 ${getRoleBadgeClass(selectedUser.roleId)}`}>
                        {getRoleName(selectedUser.roleId)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="text-slate-400 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                        <span className="text-sm font-semibold text-slate-700 block mt-0.5">{selectedUser.email || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-slate-400 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                        <span className="text-sm font-semibold text-slate-700 block mt-0.5">{selectedUser.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-slate-400 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Residential Address</span>
                        <span className="text-sm font-semibold text-slate-700 block mt-0.5">{selectedUser.address}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-slate-400 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date of Birth & Age</span>
                        <span className="text-sm font-semibold text-slate-700 block mt-0.5">
                          {new Date(selectedUser.dateOfBirth).toLocaleDateString()} ({selectedUser.age} years)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Hash size={16} className="text-slate-400 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aadhaar Card Number</span>
                        <span className="text-sm font-semibold text-slate-700 block mt-0.5">{selectedUser.aadhaarNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase size={16} className="text-slate-400 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PAN Number</span>
                        <span className="text-sm font-semibold text-slate-700 block mt-0.5">{selectedUser.panNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Info size={32} className="mx-auto mb-3" />
                  <p className="text-sm">Select a user from the directory to watch their full profile details.</p>
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
