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
  const [userId, setUserId] = useState("");
  const [balance, setBalance] = useState("0");
  
  // Deposit States
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        // Extract the 9-digit phone number from the fake email (256XXXXXXXXX@lipa.co)
        const rawPhone = user.email.split('@')[0];
        const phone = rawPhone.startsWith("256") ? rawPhone.substring(3) : rawPhone;
        
        setUserPhone(phone);
        setUserId(user.id);
        await fetchBalance(user.id);
      } else {
        router.push("/"); 
      }
    };
    getUser();
  }, [router]);

  const fetchBalance = async (uid: string) => {
    const { data } = await supabase.from("balances").select("available").eq("user_id", uid).single();
    if (data) setBalance(data.available.toString());
  };

  const handleDepositSubmit = async () => {
    const amount = Number(depositAmount);
    if (amount < 5000) {
      return setMessage({ text: "Minimum deposit is 5,000 UGX", isError: true });
    }

    setIsProcessing(true);
    setMessage({ text: "Sending USSD prompt...", isError: false });

    try {
      // Call our secure API route
      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, phone: userPhone, userId })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Success! The USSD prompt is on their phone.
      setIsDepositOpen(false);
      setDepositAmount("");
      alert("Check your phone and enter your Mobile Money PIN to complete the deposit.");
      
    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); 
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-5 pb-24">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
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
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full"></div>
        
        <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-2">Total Balance</p>
        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-lg text-green-500 font-bold">UGX</span>
          <h2 className="text-5xl font-black text-white tracking-tight">{Number(balance).toLocaleString()}</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => setIsDepositOpen(true)}
            className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition shadow-lg shadow-green-600/20 text-sm"
          >
            Deposit
          </button>
          <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition text-sm">
            Withdraw
          </button>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <button className="w-full flex items-center justify-between bg-[#121212] border border-gray-800 p-4 rounded-2xl hover:bg-gray-800 transition group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <span className="font-bold text-sm tracking-wide text-gray-200">TRANSACTION HISTORY</span>
          </div>
        </button>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full mt-8 flex items-center justify-center gap-3 bg-red-950/30 border border-red-900/50 p-4 rounded-2xl hover:bg-red-900/40 transition"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        <span className="font-bold text-red-400 tracking-widest uppercase text-sm">Log Out</span>
      </button>

      {/* --- DEPOSIT MODAL --- */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#121212] border border-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Deposit Funds</h3>
              <button onClick={() => setIsDepositOpen(false)} className="text-gray-400 hover:text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {message.text && (
              <div className={`text-center p-3 mb-4 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-900/40 text-red-200 border-red-700/50' : 'bg-green-900/40 text-green-200 border-green-700/50'}`}>
                {message.text}
              </div>
            )}

            <label className="block text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Amount (UGX)</label>
            <input 
              type="number" 
              placeholder="Minimum 5,000" 
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-4 py-4 bg-black/50 border border-gray-700 rounded-xl focus:outline-none focus:border-green-500 text-white font-bold text-2xl placeholder-gray-600 mb-6"
            />

            <p className="text-xs text-gray-500 mb-6 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              You will receive a prompt on <b>{userPhone}</b> to enter your Mobile Money PIN.
            </p>

            <button 
              onClick={handleDepositSubmit}
              disabled={isProcessing}
              className={`w-full font-bold py-4 rounded-xl transition-all text-white ${isProcessing ? 'bg-green-800 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-600/30'}`}
            >
              {isProcessing ? 'Processing...' : 'Confirm Deposit'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
                                                                                                                                                    }
