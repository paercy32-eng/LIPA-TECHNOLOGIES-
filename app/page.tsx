"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [isReady, setIsReady] = useState(false);

  // Simulate a quick loading splash
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0C10] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#7B61FF]/20 rounded-full filter blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#00D2FF]/10 rounded-full filter blur-[100px]"></div>

      {/* Center Logo & Title */}
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000 relative z-10">
        
        {/* Glowing Logo Container */}
        <div className="w-32 h-32 bg-[#12141D] border border-gray-800 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(123,97,255,0.2)] mb-8 relative">
          {/* Inner glow ring */}
          <div className="absolute inset-0 rounded-3xl border border-[#7B61FF]/30 shadow-[inset_0_0_20px_rgba(123,97,255,0.2)]"></div>
          <span className="text-5xl font-black text-[#7B61FF] tracking-tighter drop-shadow-[0_0_15px_rgba(123,97,255,0.8)]">
            LP
          </span>
        </div>
        
        <h1 className="text-4xl font-black text-white mb-2 tracking-wide text-center">
          LIPA Technologies
        </h1>
        <p className="text-[#00D2FF] text-sm font-bold tracking-widest uppercase text-center mb-16 drop-shadow-[0_0_10px_rgba(0,210,255,0.4)]">
          Grow Your Wealth
        </p>
      </div>

      {/* Loading Bar & Ready Text */}
      <div className="absolute bottom-24 flex flex-col items-center w-full max-w-xs relative z-10">
        
        {/* Progress Bar Background */}
        <div className="w-full h-2 bg-[#12141D] rounded-full overflow-hidden mb-4 border border-gray-800">
          {/* Animated Fill */}
          <div 
            className={`h-full bg-gradient-to-r from-[#7B61FF] to-[#00D2FF] rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_10px_rgba(123,97,255,0.8)] ${isReady ? 'w-full' : 'w-0'}`}
          ></div>
        </div>
        
        <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-8">
          {isReady ? "Ready" : "Loading..."}
        </p>

        {/* Get Started Button */}
        <div className={`transition-opacity duration-500 w-full ${isReady ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Link 
            href="/auth" 
            className="w-full bg-[#7B61FF] text-white font-black py-4 rounded-xl shadow-[0_5px_20px_rgba(123,97,255,0.4)] flex items-center justify-center gap-2 hover:bg-[#6a52df] transition-all transform hover:scale-105"
          >
            Get Started
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
