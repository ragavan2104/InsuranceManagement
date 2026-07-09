import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar, 
  FileText, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft, 
  Check, 
  X,
  ShieldCheck,
  LockKeyhole,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

import API from '../../services/api';
import Button from '../../components/Common/Button';

const Register = ({ onStartLoading, onStopLoading }) => {
  const navigate = useNavigate();
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');

  // Field Error State
  const [errors, setErrors] = useState({});

  // Dynamically load Toastify CSS via JSDelivr CDN on element mounting
  useEffect(() => {
    if (!document.getElementById('react-toastify-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'react-toastify-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.css';
      document.head.appendChild(link);
    }
  }, []);

  // Password Requirement Checks
  const reqMinLength = password.length >= 6;
  const reqHasUpper = /[A-Z]/.test(password);
  const reqHasNumber = /[0-9]/.test(password);
  const reqHasSpecial = /[^A-Za-z0-9]/.test(password);

  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  // Password Strength Evaluator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200', width: 'w-0' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { score: 1, label: 'Too Weak', color: 'bg-rose-500', width: 'w-1/5' };
      case 2:
        return { score: 2, label: 'Weak', color: 'bg-amber-500', width: 'w-2/5' };
      case 3:
        return { score: 3, label: 'Fair', color: 'bg-yellow-500', width: 'w-3/5' };
      case 4:
        return { score: 4, label: 'Good', color: 'bg-blue-500', width: 'w-4/5' };
      case 5:
        return { score: 5, label: 'Strong & Secure', color: 'bg-emerald-500', width: 'w-full' };
      default:
        return { score: 0, label: '', color: 'bg-slate-200', width: 'w-0' };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pre-validation checks
    const newErrors = {};
    if (!fullName) newErrors.fullName = 'Full name is required.';
    if (!email) newErrors.email = 'Email address is required.';
    if (!password) newErrors.password = 'Password is required.';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';
    if (!phone) newErrors.phone = 'Mobile number is required.';
    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required.';
    } else {
      const selectedDate = new Date(dateOfBirth);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future.';
      } else {
        let age = today.getFullYear() - selectedDate.getFullYear();
        const m = today.getMonth() - selectedDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) {
          age--;
        }
        if (age < 18) {
          newErrors.dateOfBirth = 'You must be at least 18 years old to register.';
        }
      }
    }
    if (!aadhaarNumber) newErrors.aadhaarNumber = 'Aadhaar number is required.';
    if (!licenseNumber) newErrors.licenseNumber = 'License number is required.';
    if (!address) newErrors.address = 'Address is required.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (!reqMinLength || !reqHasUpper || !reqHasNumber || !reqHasSpecial) {
      toast.error('Password does not satisfy the security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (phone.length < 10 || isNaN(Number(phone))) {
      toast.error('Mobile Number must be at least 10 numeric digits.');
      return;
    }

    if (aadhaarNumber.length !== 12 || isNaN(Number(aadhaarNumber))) {
      toast.error('Aadhaar Number must be exactly 12 numeric digits.');
      return;
    }

    if (licenseNumber.length < 10 || licenseNumber.length > 16) {
      toast.error('License Number must be between 10 and 16 characters.');
      return;
    }

    try {
      if (typeof onStartLoading === 'function') onStartLoading();
      
      const payload = {
        fullName,
        email,
        password,
        phone,
        dateOfBirth: new Date(dateOfBirth).toISOString(),
        aadhaarNumber,
        panNumber: licenseNumber.toUpperCase(), // Mapped to backend PANNumber parameter
        address,
        roleId: 1 // Strictly customer role
      };

      await API.post('/auth/register', payload);
      toast.success('Registration successful! Redirecting to login...', {
        icon: <Sparkles className="text-[#fcdb32]" size={18} />
      });
      
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
      setDateOfBirth('');
      setAadhaarNumber('');
      setLicenseNumber('');
      setAddress('');

      setTimeout(() => {
        navigate('/login');
      }, 2500);

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
          toast.error(data.message || data.title || 'Registration failed. Please check inputs.');
        }
      } else {
        toast.error('Connection to backend failed. Please try again.');
      }
    } finally {
      if (typeof onStopLoading === 'function') onStopLoading();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/60 px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Dynamic Toast Layer */}
      <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} />

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-2xl p-6 sm:p-10 relative animate-in fade-in duration-300">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#141d38] via-[#fcdb32] to-[#141d38]" />

        {/* Back Link */}
        <button 
          onClick={() => navigate('/login')}
          className="absolute top-6 left-6 text-slate-400 hover:text-[#141d38] flex items-center gap-1.5 text-xs font-bold transition cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Sign In</span>
        </button>

        {/* Brand logo header */}
        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-[#141d38] text-[#fcdb32] rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-[#141d38] shadow-md hover:scale-105 transition-transform duration-300">
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#141d38] tracking-tight">Auto Insure</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Register your profile for smart vehicle protection</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Full Name</label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
              />
              {fullName.trim().length >= 3 && (
                <Check size={16} className="absolute right-3.5 text-emerald-500" />
              )}
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Email Address</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="email"
                placeholder="username@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
              />
              {isValidEmail(email) && (
                <Check size={16} className="absolute right-3.5 text-emerald-500" />
              )}
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Section */}
          <div className="space-y-1.5 md:col-span-2 border border-slate-100 bg-slate-50/40 rounded-2xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-[#141d38] uppercase tracking-widest">Password</label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
                  />
                  {reqMinLength && reqHasUpper && reqHasNumber && reqHasSpecial && (
                    <Check size={16} className="absolute right-3.5 text-emerald-500" />
                  )}
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.password}
                  </p>
                )}
                
                {/* Strength Meter Bar */}
                {password && (
                  <div className="mt-2.5 space-y-1 animate-in fade-in duration-200">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-semibold">Security Score:</span>
                      <span className={`font-bold ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all duration-300`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-[#141d38] uppercase tracking-widest">Confirm Password</label>
                <div className="relative flex items-center">
                  <LockKeyhole size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
                  />
                  {password && confirmPassword && password === confirmPassword && (
                    <Check size={16} className="absolute right-3.5 text-emerald-500" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

            </div>

            {/* Password security constraints checkboxes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold">
              <span className={`flex items-center gap-1 ${reqMinLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                {reqMinLength ? <Check size={10} className="stroke-[3]" /> : <X size={10} />} Min 6 chars
              </span>
              <span className={`flex items-center gap-1 ${reqHasUpper ? 'text-emerald-600' : 'text-slate-400'}`}>
                {reqHasUpper ? <Check size={10} className="stroke-[3]" /> : <X size={10} />} Uppercase Letter
              </span>
              <span className={`flex items-center gap-1 ${reqHasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                {reqHasNumber ? <Check size={10} className="stroke-[3]" /> : <X size={10} />} Numeric Digit
              </span>
              <span className={`flex items-center gap-1 ${reqHasSpecial ? 'text-emerald-600' : 'text-slate-400'}`}>
                {reqHasSpecial ? <Check size={10} className="stroke-[3]" /> : <X size={10} />} Special Character
              </span>
            </div>

          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Mobile Number</label>
            <div className="relative flex items-center">
              <Phone size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
              />
              {phone.length >= 10 && (
                <Check size={16} className="absolute right-3.5 text-emerald-500" />
              )}
            </div>
            {errors.phone && (
              <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Date of Birth</label>
            <div className="relative flex items-center">
              <Calendar size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  if (errors.dateOfBirth) setErrors({...errors, dateOfBirth: null});
                }}
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
              />
            </div>
            {errors.dateOfBirth && (
              <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.dateOfBirth}
              </p>
            )}
          </div>

          {/* Aadhaar Number */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Aadhaar Card (12-digit)</label>
            <div className="relative flex items-center">
              <FileText size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                maxLength={12}
                placeholder="0000 0000 0000"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
              />
              {aadhaarNumber.length === 12 && (
                <Check size={16} className="absolute right-3.5 text-emerald-500" />
              )}
            </div>
            {errors.aadhaarNumber && (
              <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.aadhaarNumber}
              </p>
            )}
          </div>

          {/* Driving License Number */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Driving License Number</label>
            <div className="relative flex items-center">
              <FileText size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                maxLength={16}
                placeholder="e.g. DL1420110012345"
                value={licenseNumber}
                onChange={(e) => {
                  setLicenseNumber(e.target.value.toUpperCase());
                  if (errors.licenseNumber) setErrors({...errors, licenseNumber: null});
                }}
                className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold"
              />
              {licenseNumber.length >= 10 && (
                <Check size={16} className="absolute right-3.5 text-emerald-500" />
              )}
            </div>
            {errors.licenseNumber && (
              <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.licenseNumber}
              </p>
            )}
          </div>

          {/* Home Address */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Permanent Address</label>
            <div className="relative flex items-center">
              <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <textarea
                placeholder="Enter your complete home address details..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#fcdb32] focus:ring-4 focus:ring-[#fcdb32]/10 transition duration-200 text-sm font-semibold resize-none"
              />
              {address.trim().length >= 8 && (
                <Check size={16} className="absolute right-3.5 top-3.5 text-emerald-500" />
              )}
            </div>
            {errors.address && (
              <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.address}
              </p>
            )}
          </div>

          {/* Register Action buttons */}
          <div className="md:col-span-2 pt-4">
            <Button type="submit">
              <span>Register Account</span>
            </Button>
            
            <p className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-100 font-medium">
              Already have a coverage account?{' '}
              <span
                onClick={() => navigate('/login')}
                className="text-[#141d38] font-black hover:text-[#141d38]/80 hover:underline cursor-pointer transition-all duration-150"
              >
                Sign In Here
              </span>
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Register;