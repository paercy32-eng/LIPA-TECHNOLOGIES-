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
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-green-500 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Center Logo & Title */}
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-8">
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-green-500 tracking-tighter">
            LP
          </span>
        </div>
        
        <h1 className="text-4xl font-black text-white mb-2 tracking-wide text-center">
          LIPA Technologies
        </h1>
        <p className="text-blue-100 text-sm font-medium tracking-widest uppercase text-center mb-16">
          Grow Your Wealth
        </p>
      </div>

      {/* Loading Bar & Ready Text */}
      <div className="absolute bottom-24 flex flex-col items-center w-full max-w-xs">
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full bg-white rounded-full transition-all duration-[1500ms] ease-out ${isReady ? 'w-full' : 'w-0'}`}
          ></div>
        </div>
        
        <p className="text-white/80 text-sm font-semibold tracking-widest uppercase mb-8">
          {isReady ? "Ready" : "Loading..."}
        </p>

        {/* Get Started Button (Appears when ready) */}
        <div className={`transition-opacity duration-500 w-full ${isReady ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Link 
            href="/auth" 
            className="w-full bg-white text-blue-700 font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all transform hover:scale-105"
          >
            Get Started
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
