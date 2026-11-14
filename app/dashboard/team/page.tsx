"use client";

import { useState } from "react";

export default function TeamPage() {
  // We will connect these to your database later. For now, they are placeholders.
  const referralCode = "LIPA12345";
  const referralLink = `https://lipa-technologies.vercel.app/register?ref=${referralCode}`;
  
  const totalTeam = "0";
  const totalCommission = "0.00";

  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-500">My Team</h1>
        <p className="text-gray-400 text-sm">Invite friends and earn commissions</p>
      </div>

      {/* Referral Card */}
      <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg space-y-4">
        <div>
          <p className="text-gray-400 text-xs mb-1">My Referral Code</p>
          <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700">
            <span className="font-mono text-lg text-white">{referralCode}</span>
            <button 
              onClick={() => copyToClipboard(referralCode)}
              className="text-green-500 text-sm font-bold"
            >
              Copy
            </button>
          </div>
        </div>

        <div>
          <p className="text-gray-400 text-xs mb-1">My Referral Link</p>
          <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700">
            <span className="text-sm text-gray-300 truncate mr-2">{referralLink}</span>
            <button 
              onClick={() => copyToClipboard(referralLink)}
              className="text-green-500 text-sm font-bold whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
          <p className="text-gray-400 text-xs mb-1">Total Team</p>
          <h3 className="text-2xl font-bold text-white">{totalTeam}</h3>
          <p className="text-xs text-gray-500 mt-1">L1 + L2 + L3</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
          <p className="text-gray-400 text-xs mb-1">Total Commission</p>
          <h3 className="text-2xl font-bold text-green-400">${totalCommission}</h3>
          <p className="text-xs text-gray-500 mt-1">All levels</p>
        </div>
      </div>

      {/* Commission Structure */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-900/50">
          <h3 className="font-semibold text-white">Commission Levels</h3>
        </div>
        
        <div className="divide-y divide-gray-700">
          <div className="flex justify-between p-4 items-center">
            <span className="text-gray-300">Level 1 (Direct Invites)</span>
            <span className="font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm">20%</span>
          </div>
          <div className="flex justify-between p-4 items-center">
            <span className="text-gray-300">Level 2</span>
            <span className="font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm">2%</span>
          </div>
          <div className="flex justify-between p-4 items-center">
            <span className="text-gray-300">Level 3</span>
            <span className="font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm">1%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
