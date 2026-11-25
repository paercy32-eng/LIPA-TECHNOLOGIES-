"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Water Bubbles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200/50 rounded-full filter blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-200/50 rounded-full filter blur-[100px]"></div>

      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000 relative z-10">
        
        {/* Novida Logo */}
        <div className="w-32 h-32 bg-white border border-blue-100 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.15)] mb-8 relative">
          <div className="absolute inset-0 rounded-[2.5rem] border border-blue-400/20 shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]"></div>
          <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-cyan-500 tracking-tighter drop-shadow-sm">
            N
          </span>
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-wide text-center">
          Novida
        </h1>
        <p className="text-blue-600 text-sm font-bold tracking-widest uppercase text-center mb-16">
          Premium Daily Yields
        </p>
      </div>

      <div className="absolute bottom-24 flex flex-col items-center w-full max-w-xs relative z-10">
        <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)] ${isReady ? 'w-full' : 'w-0'}`}
          ></div>
        </div>
        
        <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-8">
          {isReady ? "Ready" : "Loading..."}
        </p>

        <div className={`transition-opacity duration-500 w-full ${isReady ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Link 
            href="/auth" 
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            Get Started
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
