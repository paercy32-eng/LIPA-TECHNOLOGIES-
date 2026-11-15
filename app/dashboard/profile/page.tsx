"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ProfilePage() {
  const router = useRouter();
  const [userPhone, setUserPhone] = useState("Loading...");

  // Fetch the logged-in user's phone number
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        // Extract phone from the fake email format (e.g., 0706110798@lipa.co)
        const phone = user.email.split('@')[0];
        setUserPhone(phone);
      } else {
        router.push("/"); // If no user, kick back to login
      }
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); 
  };

  // Placeholder data (we will connect these to Supabase DB later)
  const balance = "0";
  const deposited = "0";
  const withdrawn = "0";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-5 pb-24">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          {/* Logo Box */}
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            LP
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">LIPA</h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Profile</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">Signed In</p>
          <p className="text-sm font-bold text-white">{userPhone}</p>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full"></div>
        
        <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-2">Total Balance</p>
        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-lg text-green-500 font-bold">UGX</span>
          <h2 className="text-5xl font-black text-white tracking-tight">{balance}</h2>
        </div>

        {/* Sub-stats */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-black/40 rounded-2xl p-4 border border-gray-800">
            <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">DEPOSITED</p>
            <p className="text-lg font-bold text-cyan-400">UGX {deposited}</p>
          </div>
          <div className="flex-1 bg-black/40 rounded-2xl p-4 border border-gray-800">
            <p className="text-[10px] text-gray-500 font-bold tracking-wider mb-1">WITHDRAWN</p>
            <p className="text-lg font-bold text-red-400">UGX {withdrawn}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-green-600/20 text-sm">
            Deposit
          </button>
          <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition text-sm">
            Withdraw
          </button>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        
        {/* Transaction History */}
        <button className="w-full flex items-center justify-between bg-[#121212] border border-gray-800 p-4 rounded-2xl hover:bg-gray-800 transition group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <span className="font-bold text-sm tracking-wide text-gray-200">TRANSACTION HISTORY</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>

        {/* Join Telegram Group */}
        <a 
          href="https://t.me/+oj-FvpQ1jhozODA8" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between bg-[#121212] border border-gray-800 p-4 rounded-2xl hover:bg-gray-800 transition group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-900/30 rounded-xl flex items-center justify-center text-green-400 group-hover:scale-110 transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </div>
            <div className="text-left">
              <span className="font-bold text-sm tracking-wide text-gray-200 block">TELEGRAM GROUP</span>
              <span className="text-xs text-gray-500">Join for updates</span>
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>

      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full mt-8 flex items-center justify-center gap-3 bg-red-950/30 border border-red-900/50 p-4 rounded-2xl hover:bg-red-900/40 transition"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        <span className="font-bold text-red-400 tracking-widest uppercase text-sm">Log Out</span>
      </button>

    </div>
  );
}
