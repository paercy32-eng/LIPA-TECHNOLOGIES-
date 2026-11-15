"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col justify-between overflow-hidden relative">
      
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-lg font-black text-white">LP</span>
          </div>
          <span className="text-xl font-black text-gray-800 tracking-tight">LIPA</span>
        </div>
        <Link href="/auth" className="text-sm font-bold text-blue-600 hover:text-blue-800">
          Log In
        </Link>
      </header>

      {/* Main Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 border border-gray-100">
          <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600">LP</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
          Grow Your Wealth <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
            With LIPA Technologies
          </span>
        </h1>
        
        <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
          Invest in high-yield digital assets, earn daily payouts, and build your team. The future of finance is here.
        </p>

        <Link 
          href="/auth" 
          className="w-full max-w-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] transition-all transform hover:scale-105 flex items-center justify-center gap-2"
        >
          Get Started Now
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </Link>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center relative z-10">
        <p className="text-xs text-gray-400 font-medium">
          © {new Date().getFullYear()} LIPA Technologies. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
