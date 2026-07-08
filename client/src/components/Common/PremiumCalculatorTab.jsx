import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../loader';
import { Calculator, AlertCircle, RefreshCw, Info, DollarSign } from 'lucide-react';

const PremiumCalculatorTab = () => {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [vehicleYear, setVehicleYear] = useState(new Date().getFullYear());
  const [hasPriorClaims, setHasPriorClaims] = useState(false);
  const [isDriverUnder25, setIsDriverUnder25] = useState(false);
  const [isCommercialUse, setIsCommercialUse] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/Policy');
      setPolicies(response.data);
      if (response.data.length > 0) {
        setSelectedPolicyId(response.data[0].policyId.toString());
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch policy catalog for calculator.');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!selectedPolicyId) {
      setError('Please select an insurance policy to calculate.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        policyId: parseInt(selectedPolicyId),
        vehicleYear: parseInt(vehicleYear),
        hasPriorClaims,
        isDriverUnder25,
        isCommercialUse
      };

      const response = await API.post('/Policy/CalculatePremium', payload);
      setResult(response.data);
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        setError(typeof err.response.data === 'string' ? err.response.data : 'Failed to calculate premium.');
      } else {
        setError('Premium calculation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedPolicy = policies.find(p => p.policyId.toString() === selectedPolicyId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {loading && (
        <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center">
          <Loader />
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Input Parameters Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
            <Calculator className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-slate-800">Premium Estimator Parameters</h3>
          </div>

          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Policy Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Policy Plan</label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => {
                    setSelectedPolicyId(e.target.value);
                    setResult(null);
                  }}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                >
                  {policies.map(p => (
                    <option key={p.policyId} value={p.policyId}>
                      {p.policyName} ({p.policyType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Manufacturing Year */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle Manufacturing Year</label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={vehicleYear}
                  onChange={(e) => {
                    setVehicleYear(e.target.value);
                    setResult(null);
                  }}
                  required
                  placeholder="e.g. 2022"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition duration-200 text-sm"
                />
              </div>

            </div>

            {/* Risk Factors Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Risk Factors Checklist</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Prior Claims */}
                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/50 hover:bg-slate-100/50 transition duration-150 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPriorClaims}
                    onChange={(e) => {
                      setHasPriorClaims(e.target.checked);
                      setResult(null);
                    }}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800">Has Prior Claims</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Increases base premium risk factor</span>
                  </div>
                </label>

                {/* Driver Age */}
                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/50 hover:bg-slate-100/50 transition duration-150 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDriverUnder25}
                    onChange={(e) => {
                      setIsDriverUnder25(e.target.checked);
                      setResult(null);
                    }}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800">Driver Under 25</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Adds risk markup surcharge</span>
                  </div>
                </label>

                {/* Commercial Use */}
                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/50 hover:bg-slate-100/50 transition duration-150 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCommercialUse}
                    onChange={(e) => {
                      setIsCommercialUse(e.target.checked);
                      setResult(null);
                    }}
                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-800">Commercial Use</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Applies heavy usage premium rate</span>
                  </div>
                </label>

              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 text-sm cursor-pointer shadow-md shadow-blue-500/10"
            >
              <RefreshCw size={16} className="animate-spin-slow" />
              <span>Calculate Premium Estimate</span>
            </button>
          </form>
        </div>

        {/* Breakdown Output Panel */}
        <div className="space-y-6">
          {result ? (
            <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-8 border border-slate-800 space-y-6 animate-in slide-in-from-bottom duration-300">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Estimation Output</span>
                <h3 className="text-lg font-bold text-white mt-1">Premium Breakdown</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Base Premium:</span>
                  <span className="text-slate-200 font-semibold">₹{result.basePremium.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Vehicle Age Surcharge:</span>
                  <span className="text-amber-400 font-semibold">+₹{result.vehicleAgeSurcharge.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Risk Factors Markup:</span>
                  <span className="text-amber-400 font-semibold">+₹{result.riskSurcharge.toFixed(2)}</span>
                </div>

                <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                  <span className="text-slate-300 font-bold text-base">Net Premium:</span>
                  <span className="text-blue-400 font-black text-2xl">₹{result.totalPremium.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80 text-[10px] text-slate-400 space-y-1.5">
                <div className="flex gap-1.5 items-start">
                  <Info size={12} className="shrink-0 text-blue-400 mt-0.5" />
                  <p>Estimates are calculated using real-time vehicle age thresholds and commercial/under-25 risk multipliers.</p>
                </div>
              </div>
            </div>
          ) : selectedPolicy ? (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-8 space-y-4 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm">Coverage Summary</h4>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Plan Name:</span>
                  <span className="font-semibold text-slate-700">{selectedPolicy.policyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="font-semibold text-slate-700">{selectedPolicy.policyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Policy Term:</span>
                  <span className="font-semibold text-slate-700">{selectedPolicy.policyDurationMonths} Months</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span className="text-slate-400">Coverage Limit:</span>
                  <span className="font-semibold text-blue-600">₹{selectedPolicy.coverageAmount}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100/50 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
              Fill and submit parameters to evaluate estimation.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default PremiumCalculatorTab;
