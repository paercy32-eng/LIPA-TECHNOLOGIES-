"use client";

import { useState } from "react";

export default function TeamPage() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Placeholder data (to be connected to Supabase database later)
  const referralCode = "LIPA12345";
  const referralLink = `https://lipa-technologies.vercel.app/?ref=${referralCode}`;
  
  const totalTeam = "0";
  const totalCommission = "0";

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-5 pb-24">
      
      {/* Header */}
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">My Team</h1>
        <p className="text-gray-400 text-sm mt-1">Invite friends and earn passive commissions</p>
      </div>

      {/* Referral Link & Code Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-3xl p-5 mb-6 shadow-2xl relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 blur-3xl rounded-full"></div>

        <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          Your Invite Link
        </h2>

        {/* Code */}
        <div className="mb-4">
          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1.5">Referral Code</p>
          <div className="flex items-center justify-between bg-black/50 border border-gray-700 p-3 rounded-xl">
            <span className="font-mono text-lg font-bold text-[#00d2ff] tracking-wider">{referralCode}</span>
            <button 
              onClick={() => copyToClipboard(referralCode, 'code')}
              className="text-xs font-bold bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition"
            >
              {copiedCode ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Link */}
        <div>
          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1.5">Referral Link</p>
          <div className="flex items-center justify-between bg-black/50 border border-gray-700 p-3 rounded-xl">
            <span className="text-xs text-gray-400 truncate mr-2">{referralLink}</span>
            <button 
              onClick={() => copyToClipboard(referralLink, 'link')}
              className="text-xs font-bold bg-[#00d2ff] text-black px-3 py-1.5 rounded-lg hover:bg-cyan-400 transition whitespace-nowrap"
            >
              {copiedLink ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#121212] border border-gray-800 p-5 rounded-2xl flex flex-col items-center justify-center shadow-lg">
          <div className="text-gray-500 mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <p className="text-gray-400 text-xs font-medium mb-1">Total Team</p>
          <h3 className="text-3xl font-black text-white">{totalTeam}</h3>
        </div>
        
        <div className="bg-[#121212] border border-gray-800 p-5 rounded-2xl flex flex-col items-center justify-center shadow-lg">
          <div className="text-green-500 mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          </div>
          <p className="text-gray-400 text-xs font-medium mb-1">Total Comm.</p>
          <h3 className="text-3xl font-black text-green-400">UGX {totalCommission}</h3>
        </div>
      </div>

      {/* Commission Structure */}
      <div>
        <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-widest">Commission Structure</h3>
        
        <div className="space-y-3">
          
          {/* Level 1 */}
          <div className="flex items-center justify-between bg-[#121212] border border-gray-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-900/30 rounded-xl flex items-center justify-center text-green-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Level 1 (Direct)</p>
                <p className="text-[10px] text-gray-500">Friends you invite directly</p>
              </div>
            </div>
            <span className="font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20">20%</span>
          </div>

          {/* Level 2 */}
          <div className="flex items-center justify-between bg-[#121212] border border-gray-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Level 2</p>
                <p className="text-[10px] text-gray-500">Friends invited by your team</p>
              </div>
            </div>
            <span className="font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">2%</span>
          </div>

          {/* Level 3 */}
          <div className="flex items-center justify-between bg-[#121212] border border-gray-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Level 3</p>
                <p className="text-[10px] text-gray-500">Extended network</p>
              </div>
            </div>
            <span className="font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">1%</span>
          </div>

        </div>
      </div>
    </div>
  );
}
