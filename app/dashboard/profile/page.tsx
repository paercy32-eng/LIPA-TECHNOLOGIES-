"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ProfilePage() {
  const router = useRouter();
  const [userPhone, setUserPhone] = useState("Loading...");
  const [userId, setUserId] = useState("");
  const [balance, setBalance] = useState("0");
  const [fullName, setFullName] = useState("");
  const [boundNumber, setBoundNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  
  // Modals State
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isBindOpen, setIsBindOpen] = useState(false);
  
  // Form States
  const [depositAmount, setDepositAmount] = useState("");
  const [depositPhone, setDepositPhone] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  
  // Bind Form State
  const [bindName, setBindName] = useState("");
  const [bindPhone, setBindPhone] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const rawPhone = user.email.split('@')[0];
        const phone = rawPhone.startsWith("256") ? rawPhone.substring(3) : rawPhone;
        
        setUserPhone(phone);
        setDepositPhone(phone); 
        setUserId(user.id);

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, full_name, bound_number")
          .eq("id", user.id)
          .single();
          
        if (profile) {
          setDisplayName(profile.display_name || `user ${phone.slice(-4)}`);
          setFullName(profile.full_name || "");
          setBoundNumber(profile.bound_number || "");
          setBindName(profile.full_name || "");
          setBindPhone(profile.bound_number || "");
        }

        const { data: bal } = await supabase.from("balances").select("available").eq("user_id", user.id).single();
        if (bal) setBalance(bal.available.toString());
      } else {
        router.push("/"); 
      }
    };
    getUser();
  }, [router]);

  // --- BIND ACCOUNT LOGIC ---
  const handleBindSubmit = async () => {
    if (!bindName || !bindPhone) return setMessage({ text: "Please fill all fields", isError: true });
    if (bindPhone.length < 9) return setMessage({ text: "Invalid phone number", isError: true });

    setIsProcessing(true);
    const { error } = await supabase.from("profiles").update({
      full_name: bindName,
      bound_number: bindPhone
    }).eq("id", userId);

    setIsProcessing(false);
    if (error) {
      setMessage({ text: error.message, isError: true });
    } else {
      setFullName(bindName);
      setBoundNumber(bindPhone);
      setIsBindOpen(false);
      alert("Account bound successfully!");
    }
  };

  // --- DEPOSIT LOGIC ---
  const handleDepositSubmit = async () => {
    const amount = Number(depositAmount);
    if (amount < 500) return setMessage({ text: "Minimum deposit is 500 UGX", isError: true });
    if (!depositPhone || depositPhone.length < 9) return setMessage({ text: "Please enter a valid phone number", isError: true });

    setIsProcessing(true);
    try {
      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, phone: depositPhone, userId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setIsDepositOpen(false);
      setDepositAmount("");
      alert("Check your phone and enter your Mobile Money PIN to complete the deposit.");
    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- WITHDRAW LOGIC ---
  const handleWithdrawSubmit = async () => {
    if (!boundNumber) {
      setIsWithdrawOpen(false);
      return alert("You must bind an account before withdrawing.");
    }

    const amount = Number(withdrawAmount);
    if (amount < 3000) return setMessage({ text: "Minimum withdrawal is 3,000 UGX", isError: true });
    if (amount > Number(balance)) return setMessage({ text: "Insufficient balance", isError: true });

    setIsProcessing(true);
    setMessage({ text: "", isError: false });

    try {
      // NEW: Check for active product before allowing withdrawal
      const { count: activeInv, error: invError } = await supabase
        .from("investments")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userId)
        .eq("status", "ACTIVE");

      if (invError) throw invError;

      if (activeInv === 0) {
        setIsProcessing(false);
        return setMessage({ text: "You must have an active product (purchased or granted) to withdraw.", isError: true });
      }

      // Check time restriction (9 AM to 5 PM EAT)
      const now = new Date();
      const eatTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Kampala', hour: 'numeric', hour12: false }).format(now);
      const currentHour = parseInt(eatTime);
      if (currentHour < 9 || currentHour >= 17) {
        setIsProcessing(false);
        return setMessage({ text: "Withdrawals are only allowed between 9:00 AM and 5:00 PM.", isError: true });
      }

      // Deduct balance
      const newBalance = Number(balance) - amount;
      const { error: balUpdateError } = await supabase.from("balances").update({ available: newBalance }).eq("user_id", userId);
      if (balUpdateError) throw balUpdateError;

      // Create transaction record
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: userId,
        type: "WITHDRAWAL",
        amount: amount,
        status: "PENDING",
      });
      if (txError) throw txError;

      setBalance(newBalance.toString());
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      alert(`Withdrawal request submitted! You will receive UGX ${(amount * 0.87).toLocaleString()} to ${boundNumber}.`);

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
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]">LP</div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">LIPA</h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Profile</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">Signed In</p>
          <p className="text-sm font-bold text-white">{displayName || userPhone}</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full"></div>
        <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-2">Total Balance</p>
        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-lg text-green-500 font-bold">UGX</span>
          <h2 className="text-5xl font-black text-white tracking-tight">{Number(balance).toLocaleString()}</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setIsDepositOpen(true); setMessage({text:"", isError:false}); }} className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition shadow-lg shadow-green-600/20 text-sm">Deposit</button>
          <button onClick={() => { setIsWithdrawOpen(true); setMessage({text:"", isError:false}); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition text-sm">Withdraw</button>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <Link href="/dashboard/history" className="w-full flex items-center justify-between bg-[#121212] border border-gray-800 p-4 rounded-2xl hover:bg-gray-800 transition group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <span className="font-bold text-sm tracking-wide text-gray-200">Transaction history</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </Link>

        <button onClick={() => setIsBindOpen(true)} className="w-full flex items-center justify-between bg-[#121212] border border-gray-800 p-4 rounded-2xl hover:bg-gray-800 transition group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div className="text-left">
              <span className="font-bold text-sm tracking-wide text-gray-200 block">Bind Account</span>
              <span className="text-xs text-gray-500">{boundNumber ? `Bound to ${boundNumber}` : "Not bound"}</span>
            </div>
          </div>
        </button>

        <a href="https://t.me/+oj-FvpQ1jhozODA8" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between bg-[#121212] border border-gray-800 p-4 rounded-2xl hover:bg-gray-800 transition group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-900/30 rounded-xl flex items-center justify-center text-green-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </div>
            <span className="font-bold text-sm tracking-wide text-gray-200">Join Telegram Group</span>
          </div>
        </a>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full mt-8 flex items-center justify-center gap-3 bg-red-950/30 border border-red-900/50 p-4 rounded-2xl hover:bg-red-900/40 transition">
        <span className="font-bold text-red-400 tracking-widest uppercase text-sm">Log Out</span>
      </button>

      {/* --- BIND ACCOUNT MODAL --- */}
      {isBindOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Bind Account</h3>
              <button onClick={() => setIsBindOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Full Names (as on Mobile Money)</label>
            <input type="text" placeholder="e.g. John Doe" value={bindName} onChange={(e) => setBindName(e.target.value)} className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:outline-none focus:border-green-500 text-white mb-4" />
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Mobile Money Number</label>
            <input type="tel" placeholder="e.g. 0700123456" value={bindPhone} onChange={(e) => setBindPhone(e.target.value)} className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl focus:outline-none focus:border-green-500 text-white mb-6" />
            <button onClick={handleBindSubmit} disabled={isProcessing} className="w-full font-bold py-4 rounded-xl text-white bg-green-600 hover:bg-green-500">
              {isProcessing ? 'Saving...' : boundNumber ? 'Update Account' : 'Save Account'}
            </button>
          </div>
        </div>
      )}

      {/* --- DEPOSIT MODAL --- */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Deposit Funds</h3>
              <button onClick={() => setIsDepositOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            {message.text && <div className={`text-center p-3 mb-4 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-900/40 text-red-200 border-red-700/50' : 'bg-green-900/40 text-green-200 border-green-700/50'}`}>{message.text}</div>}
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Amount (UGX)</label>
            <input type="number" placeholder="Minimum 500" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white font-bold text-lg mb-4" />
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Phone Number to Pay From</label>
            <input type="tel" placeholder="e.g. 0700123456" value={depositPhone} onChange={(e) => setDepositPhone(e.target.value)} className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white font-bold text-lg mb-6" />
            <button onClick={handleDepositSubmit} disabled={isProcessing} className="w-full font-bold py-4 rounded-xl text-white bg-green-600 hover:bg-green-500">{isProcessing ? 'Processing...' : 'Confirm Deposit'}</button>
          </div>
        </div>
      )}

      {/* --- WITHDRAW MODAL --- */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
              <button onClick={() => setIsWithdrawOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            {message.text && <div className={`text-center p-3 mb-4 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-900/40 text-red-200 border-red-700/50' : 'bg-green-900/40 text-green-200 border-green-700/50'}`}>{message.text}</div>}

            {!boundNumber ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-4">You must bind an account before you can withdraw.</p>
                <button onClick={() => { setIsWithdrawOpen(false); setIsBindOpen(true); }} className="bg-purple-600 text-white font-bold py-3 px-6 rounded-xl">Bind Account Now</button>
              </div>
            ) : (
              <>
                <div className="bg-blue-900/20 border border-blue-800/50 p-3 rounded-xl mb-4">
                  <p className="text-xs text-blue-300">Withdrawing to: <b>{fullName}</b> ({boundNumber}). A fee of <b>13%</b> applies.</p>
                </div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Amount (UGX)</label>
                <input type="number" placeholder="Minimum 3,000" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white font-bold text-lg mb-2" />
                <div className="flex justify-between items-center mb-6 px-1">
                  <p className="text-xs text-gray-500">Available: UGX {Number(balance).toLocaleString()}</p>
                  {withdrawAmount && <p className="text-xs text-green-400 font-bold">You Receive: UGX {(Number(withdrawAmount) * 0.87).toLocaleString()}</p>}
                </div>
                <button onClick={handleWithdrawSubmit} disabled={isProcessing} className="w-full font-bold py-4 rounded-xl text-white bg-green-600 hover:bg-green-500">{isProcessing ? 'Processing...' : 'Request Withdrawal'}</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
              }
