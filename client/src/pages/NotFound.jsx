import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#141d38] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="text-center space-y-4">

        <h1 className="text-6xl font-black text-[#fcdb32]">404</h1>
        <p className="text-sm text-slate-300">Page not found</p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="bg-[#fcdb32] text-[#141d38] py-2 px-5 rounded-xl text-xs font-black uppercase tracking-wider"
          >
            Go Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="bg-white/5 border border-white/10 py-2 px-5 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFound;