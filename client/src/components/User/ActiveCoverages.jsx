import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Eye, X, Calendar, Car, FileCheck, DollarSign, Activity } from 'lucide-react';

const ActiveCoverages = ({ activePolicies }) => {
  const navigate = useNavigate();
  const [selectedCoverage, setSelectedCoverage] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'PolicyIssued':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100/50';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md hover:scale-[1.005] transition-all duration-300 ease-out">
      <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
        <h3 className="text-base font-bold text-slate-800">My Active Coverages</h3>
      </div>
      {activePolicies.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <p className="text-sm mb-4">You do not have any active insurance policies currently.</p>
          <button 
            className="bg-slate-100 hover:bg-slate-200 active:scale-[0.97] text-slate-700 text-xs font-semibold py-2 px-4 rounded-lg transition-all duration-200 cursor-pointer"
            onClick={() => navigate('/apply-proposal')}
          >
            Browse Policies
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Policy</th>
                <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Vehicle</th>
                <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">Coverage Term</th>
                <th className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {activePolicies.map(p => (
                <tr key={p.proposalId} className="hover:bg-slate-50/40 transition duration-150">
                  <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                    <strong className="text-slate-800 font-semibold block">{p.insurancePolicy?.policyName}</strong>
                    <span className="text-xs text-slate-400 mt-0.5 block">Type: {p.insurancePolicy?.policyType}</span>
                  </td>
                  <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                    <span className="text-slate-700 font-medium block">{p.vehicleMake} {p.vehicleModel}</span>
                    <span className="text-xs text-slate-400 mt-0.5 block">{p.vehicleNumber}</span>
                  </td>
                  <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle">
                    <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded">
                      {p.insurancePolicy?.policyDurationMonths || 12} Months
                    </span>
                  </td>
                  <td className="py-4 text-sm text-slate-600 border-b border-slate-50 align-middle text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 active:scale-[0.96] text-slate-600 text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-sm cursor-pointer"
                        onClick={() => setSelectedCoverage(p)}
                        title="View Policy Details"
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>
                      <button 
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 active:scale-[0.96] text-slate-600 text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-200 shadow-sm cursor-pointer"
                        onClick={() => navigate('/file-claim', { 
                          state: {
                            issuedPolicyId: p.issuedPolicyId, 
                            policyName: p.insurancePolicy?.policyName,
                            vehicleInfo: `${p.vehicleMake} ${p.vehicleModel} (${p.vehicleNumber})`
                          }
                        })}
                      >
                        <ShieldAlert size={14} />
                        <span>File Claim</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Coverage Details Modal */}
      {selectedCoverage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1.5 ${getStatusBadge(selectedCoverage.status)}`}>
                  Active Coverage
                </span>
                <h4 className="text-lg font-bold text-slate-800">{selectedCoverage.insurancePolicy?.policyName || selectedCoverage.policyName}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Policy Type: {selectedCoverage.insurancePolicy?.policyType || selectedCoverage.policyType}</p>
              </div>
              <button 
                onClick={() => setSelectedCoverage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition duration-150 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-5 flex-1">
              
              {/* Issued Number */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="text-blue-500" size={18} />
                  <span className="text-xs text-slate-400 font-medium">Policy Reference:</span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200">
                  {selectedCoverage.issuedPolicyId ? `IPOL-REF-#${selectedCoverage.issuedPolicyId}` : `PROP-REF-#${selectedCoverage.proposalId}`}
                </span>
              </div>

              {/* Grid section */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Vehicle Details */}
                <div className="border border-slate-100 rounded-xl p-4 space-y-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Car size={12} className="text-slate-400" />
                    <span>Vehicle Info</span>
                  </span>
                  <div>
                    <span className="text-xs text-slate-700 font-bold block">{selectedCoverage.vehicleMake} {selectedCoverage.vehicleModel}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Reg: {selectedCoverage.vehicleNumber}</span>
                    <span className="text-[10px] text-slate-400 block">Year: {selectedCoverage.vehicleYear} (Age: {selectedCoverage.vehicleAge} Yrs)</span>
                  </div>
                </div>

                {/* Term details */}
                <div className="border border-slate-100 rounded-xl p-4 space-y-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <Calendar size={12} className="text-slate-400" />
                    <span>Coverage Period</span>
                  </span>
                  <div>
                    <span className="text-xs text-slate-700 font-bold block">{selectedCoverage.insurancePolicy?.policyDurationMonths || 12} Months</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Applied: {new Date(selectedCoverage.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>

              </div>

              {/* Premium Breakdown */}
              <div className="space-y-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  <DollarSign size={12} className="text-slate-400" />
                  <span>Financial Breakdown</span>
                </span>
                
                <div className="border border-slate-100 rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Policy Declared Value (IDV)</span>
                    <span className="font-semibold text-slate-700">₹{selectedCoverage.finalInsuredDeclaredValue || selectedCoverage.insurancePolicy?.coverageAmount || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Base Premium Rate</span>
                    <span className="font-semibold text-slate-700">₹{selectedCoverage.insurancePolicy?.basePremium || 0}</span>
                  </div>

                  {selectedCoverage.appliedAddOnName && selectedCoverage.appliedAddOnName.length > 0 && (
                    <div className="border-t border-dashed border-slate-100 pt-2">
                      <span className="text-[10px] text-slate-400 font-medium block mb-1.5">Selected Add-On Benefits:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCoverage.appliedAddOnName.map((addon, index) => (
                          <span key={index} className="bg-slate-50 text-slate-600 text-[10px] px-2 py-0.5 rounded border border-slate-200/50">
                            {addon}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">Total Premium Paid</span>
                    <span className="text-sm font-extrabold text-blue-600">₹{selectedCoverage.totalCalculatedPremium || 0}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="border-t border-slate-100 pt-4 mt-6 flex justify-end gap-2 shrink-0">
              <button 
                onClick={() => setSelectedCoverage(null)}
                className="bg-slate-50 hover:bg-slate-100 active:scale-[0.98] text-slate-600 font-semibold py-2 px-4 rounded-xl transition duration-150 text-xs cursor-pointer border border-slate-100"
              >
                Close
              </button>
              <button 
                className="bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-semibold py-2 px-4 rounded-xl transition duration-150 text-xs cursor-pointer shadow-sm inline-flex items-center gap-1"
                onClick={() => {
                  setSelectedCoverage(null);
                  navigate('/file-claim', { 
                    state: {
                      issuedPolicyId: selectedCoverage.issuedPolicyId, 
                      policyName: selectedCoverage.insurancePolicy?.policyName || selectedCoverage.policyName,
                      vehicleInfo: `${selectedCoverage.vehicleMake} ${selectedCoverage.vehicleModel} (${selectedCoverage.vehicleNumber})`
                    }
                  });
                }}
              >
                <ShieldAlert size={14} />
                <span>File a Claim</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ActiveCoverages;
