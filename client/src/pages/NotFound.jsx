import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, Home, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

/* ── Inline design tokens matching the app theme ───────────────────── */
const C = {
  navy:   '#141d38',
  navyMid:'#1e2d50',
  navyLt: '#243460',
  gold:   '#fcdb32',
  goldDim:'#f5c800',
  white:  '#ffffff',
};

/* ── Tiny floating particle ─────────────────────────────────────────── */
const Particle = ({ style }) => (
  <div
    style={{
      position: 'absolute',
      borderRadius: '50%',
      background: C.gold,
      opacity: 0.18,
      animation: 'floatUp 6s ease-in-out infinite',
      ...style,
    }}
  />
);

const NotFound = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(10);

  /* Auto-redirect countdown */
  useEffect(() => {
    if (count <= 0) {
      navigate('/');
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate]);

  const particles = [
    { width: 10, height: 10, top: '15%', left: '8%',  animationDelay: '0s',   animationDuration: '7s'  },
    { width: 6,  height: 6,  top: '70%', left: '5%',  animationDelay: '1.5s', animationDuration: '5s'  },
    { width: 14, height: 14, top: '25%', right: '7%', animationDelay: '0.8s', animationDuration: '8s'  },
    { width: 8,  height: 8,  top: '60%', right: '4%', animationDelay: '2s',   animationDuration: '6s'  },
    { width: 5,  height: 5,  top: '45%', left: '12%', animationDelay: '3s',   animationDuration: '9s'  },
    { width: 9,  height: 9,  top: '80%', right: '12%',animationDelay: '1s',   animationDuration: '7.5s'},
  ];

  return (
    <>
      {/* ── keyframes injected once ─────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-22px) scale(1.15); }
        }
        @keyframes pulse404 {
          0%, 100% { text-shadow: 0 0 40px rgba(252,219,50,0.35), 0 0 80px rgba(252,219,50,0.12); }
          50%       { text-shadow: 0 0 70px rgba(252,219,50,0.6),  0 0 140px rgba(252,219,50,0.22); }
        }
        @keyframes shieldBob {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50%       { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes countRing {
          from { stroke-dashoffset: 251; }
          to   { stroke-dashoffset: 0; }
        }
        .nf-fade { animation: fadeSlideUp 0.6s ease forwards; }
        .nf-fade-1 { animation-delay: 0.1s; opacity: 0; }
        .nf-fade-2 { animation-delay: 0.25s; opacity: 0; }
        .nf-fade-3 { animation-delay: 0.4s; opacity: 0; }
        .nf-fade-4 { animation-delay: 0.55s; opacity: 0; }
        .nf-fade-5 { animation-delay: 0.7s; opacity: 0; }
        .nf-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 12px;
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: all 0.22s ease; border: none;
          text-decoration: none;
        }
        .nf-btn-primary {
          background: ${C.gold}; color: ${C.navy};
        }
        .nf-btn-primary:hover {
          background: ${C.goldDim}; transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(252,219,50,0.35);
        }
        .nf-btn-ghost {
          background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .nf-btn-ghost:hover {
          background: rgba(255,255,255,0.14); transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.2);
        }
        .countdown-svg circle {
          animation: countRing ${count}s linear forwards;
        }
      `}</style>

      {/* ── Page wrapper ──────────────────────────────────────────────── */}
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(145deg, ${C.navy} 0%, ${C.navyMid} 55%, ${C.navyLt} 100%)`,
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Decorative grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }} />

        {/* Top gradient glow */}
        <div style={{
          position: 'absolute', top: '-120px', left: '50%',
          transform: 'translateX(-50%)',
          width: '600px', height: '300px',
          background: `radial-gradient(ellipse, rgba(252,219,50,0.12) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Floating particles */}
        {particles.map((p, i) => <Particle key={i} style={p} />)}

        {/* ── Card ──────────────────────────────────────────────────── */}
        <div style={{
          position: 'relative', zIndex: 10,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '28px',
          padding: '56px 48px',
          maxWidth: '520px', width: '100%',
          textAlign: 'center',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        }}>

          {/* Shield icon */}
          <div className="nf-fade nf-fade-1" style={{
            display: 'flex', justifyContent: 'center', marginBottom: '24px',
          }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: `linear-gradient(145deg, rgba(252,219,50,0.18), rgba(252,219,50,0.06))`,
              border: `2px solid rgba(252,219,50,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'shieldBob 3.5s ease-in-out infinite',
            }}>
              <ShieldOff size={40} color={C.gold} strokeWidth={1.5} />
            </div>
          </div>

          {/* 404 number */}
          <div className="nf-fade nf-fade-2" style={{
            fontSize: 'clamp(80px, 18vw, 120px)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-4px',
            color: C.gold,
            animation: 'pulse404 3s ease-in-out infinite',
            marginBottom: '8px',
          }}>
            404
          </div>

          {/* Divider line */}
          <div className="nf-fade nf-fade-2" style={{
            height: 2, borderRadius: 2,
            background: `linear-gradient(90deg, transparent, ${C.gold}55, transparent)`,
            margin: '0 auto 20px',
            maxWidth: 220,
          }} />

          {/* Headline */}
          <h1 className="nf-fade nf-fade-3" style={{
            fontSize: '22px', fontWeight: 800, color: C.white,
            margin: '0 0 10px', letterSpacing: '-0.5px',
          }}>
            Page Not Found
          </h1>

          {/* Sub-text */}
          <p className="nf-fade nf-fade-3" style={{
            fontSize: '14px', color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.7, margin: '0 0 32px',
          }}>
            The page you're looking for doesn't exist or has been moved.<br />
            Your coverage is still active — let's get you back on track.
          </p>

          {/* Alert strip */}
          <div className="nf-fade nf-fade-4" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(252,219,50,0.08)',
            border: '1px solid rgba(252,219,50,0.2)',
            borderRadius: '12px', padding: '10px 16px',
            marginBottom: '28px', textAlign: 'left',
          }}>
            <AlertTriangle size={16} color={C.gold} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
              Auto-redirecting in{' '}
              <strong style={{ color: C.gold }}>{count}s</strong>
            </span>
          </div>

          {/* Action buttons */}
          <div className="nf-fade nf-fade-5" style={{
            display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',
          }}>
            <button
              className="nf-btn nf-btn-primary"
              onClick={() => navigate('/')}
            >
              <Home size={15} />
              Go Home
            </button>
            <button
              className="nf-btn nf-btn-ghost"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={15} />
              Go Back
            </button>
            <button
              className="nf-btn nf-btn-ghost"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>

          {/* Brand badge */}
          <div className="nf-fade nf-fade-5" style={{
            marginTop: '36px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: C.gold,
            }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              AutoShield Protection · Secure Portal
            </span>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: C.gold,
            }} />
          </div>

        </div>
      </div>
    </>
  );
};

export default NotFound;
