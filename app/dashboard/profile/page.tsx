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
        router.push("/auth"); 
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
    setMessage({ text: "", isError: false });

    try {
      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, phone: depositPhone, userId })
      });
      
      // SAFELY READ TEXT FIRST to prevent "Unexpected end of JSON input" crash
      const responseText = await response.text();
      
      if (!responseText) {
        throw new Error("Server error: No response from API. Check Vercel logs.");
      }

      const data = JSON.parse(responseText);

      if (!response.ok) throw new Error(data.error || "Deposit failed");

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
      const { count: activeInv, error: invError } = await supabase
        .from("investments")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userId)
        .eq("status", "ACTIVE");

      if (invError) throw invError;

      if (activeInv === 0) {
        setIsProcessing(false);
        return setMessage({ text: "You must have an active product to withdraw.", isError: true });
      }

      const now = new Date();
      const eatTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Kampala', hour: 'numeric', hour12: false }).format(now);
      const currentHour = parseInt(eatTime);
      if (currentHour < 9 || currentHour >= 17) {
        setIsProcessing(false);
        return setMessage({ text: "Withdrawals allowed between 9:00 AM and 5:00 PM.", isError: true });
      }

      const newBalance = Number(balance) - amount;
      await supabase.from("balances").update({ available: newBalance }).eq("user_id", userId);
      await supabase.from("transactions").insert({ user_id: userId, type: "WITHDRAWAL", amount: amount, status: "PENDING" });

      setBalance(newBalance.toString());
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      alert(`Withdrawal submitted! You will receive UGX ${(amount * 0.87).toLocaleString()} to ${boundNumber}.`);

    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth"); 
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 p-5 pb-24">
      <div className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md">LP</div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-wide">Profile</h1>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{displayName || userPhone}</p>
          </div>
        </div>
      </div>

      {/* Bright Balance Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-3xl rounded-full"></div>
        <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-2">Total Balance</p>
        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-lg text-blue-500 font-bold">UGX</span>
          <h2 className="text-5xl font-black text-gray-900 tracking-tight">{Number(balance).toLocaleString()}</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setIsDepositOpen(true); setMessage({text:"", isError:false}); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-blue-600/20 text-sm">Deposit</button>
          <button onClick={() => { setIsWithdrawOpen(true); setMessage({text:"", isError:false}); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition text-sm">Withdraw</button>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <Link href="/dashboard/history" className="w-full flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl hover:bg-gray-50 transition group shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <span className="font-bold text-sm text-gray-800">Transaction history</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </Link>

        <button onClick={() => setIsBindOpen(true)} className="w-full flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl hover:bg-gray-50 transition group shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div className="text-left">
              <span className="font-bold text-sm text-gray-800 block">Bind Account</span>
              <span className="text-xs text-gray-500">{boundNumber ? `Bound to ${boundNumber}` : "Not bound"}</span>
            </div>
          </div>
        </button>

        <a href="https://t.me/+oj-FvpQ1jhozODA8" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl hover:bg-gray-50 transition group shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </div>
            <span className="font-bold text-sm text-gray-800">Join Telegram Group</span>
          </div>
        </a>
      </div>

      <button onClick={handleLogout} className="w-full mt-8 flex items-center justify-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl hover:bg-red-100 transition">
        <span className="font-bold text-red-500 tracking-widest uppercase text-sm">Log Out</span>
      </button>

      {/* --- BIND ACCOUNT MODAL --- */}
      {isBindOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Bind Account</h3>
              <button onClick={() => setIsBindOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Full Names (as on Mobile Money)</label>
            <input type="text" placeholder="e.g. John Doe" value={bindName} onChange={(e) => setBindName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 mb-4" />
            <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Mobile Money Number</label>
            <input type="tel" placeholder="e.g. 0700123456" value={bindPhone} onChange={(e) => setBindPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 mb-6" />
            <button onClick={handleBindSubmit} disabled={isProcessing} className="w-full font-bold py-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700">
              {isProcessing ? 'Saving...' : boundNumber ? 'Update Account' : 'Save Account'}
            </button>
          </div>
        </div>
      )}

      {/* --- DEPOSIT MODAL --- */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Deposit Funds</h3>
              <button onClick={() => setIsDepositOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>
            {message.text && <div className={`text-center p-3 mb-4 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{message.text}</div>}
            <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Amount (UGX)</label>
            <input type="number" placeholder="Minimum 500" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold text-lg mb-4 focus:outline-none focus:border-blue-500" />
            <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Phone Number to Pay From</label>
            <input type="tel" placeholder="e.g. 0700123456" value={depositPhone} onChange={(e) => setDepositPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold text-lg mb-6 focus:outline-none focus:border-blue-500" />
            <button onClick={handleDepositSubmit} disabled={isProcessing} className="w-full font-bold py-4 rounded-xl text-white bg-green-600 hover:bg-green-700">{isProcessing ? 'Processing...' : 'Confirm Deposit'}</button>
          </div>
        </div>
      )}

      {/* --- WITHDRAW MODAL --- */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Withdraw Funds</h3>
              <button onClick={() => setIsWithdrawOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>
            
            {message.text && <div className={`text-center p-3 mb-4 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{message.text}</div>}

            {!boundNumber ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-4">You must bind an account before you can withdraw.</p>
                <button onClick={() => { setIsWithdrawOpen(false); setIsBindOpen(true); }} className="bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700">Bind Account Now</button>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4">
                  <p className="text-xs text-blue-700">Withdrawing to: <b>{fullName}</b> ({boundNumber}). A fee of <b>13%</b> applies.</p>
                </div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Amount (UGX)</label>
                <input type="number" placeholder="Minimum 3,000" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold text-lg mb-2 focus:outline-none focus:border-blue-500" />
                <div className="flex justify-between items-center mb-6 px-1">
                  <p className="text-xs text-gray-500">Available: UGX {Number(balance).toLocaleString()}</p>
                  {withdrawAmount && <p className="text-xs text-green-600 font-bold">You Receive: UGX {(Number(withdrawAmount) * 0.87).toLocaleString()}</p>}
                </div>
                <button onClick={handleWithdrawSubmit} disabled={isProcessing} className="w-full font-bold py-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700">{isProcessing ? 'Processing...' : 'Request Withdrawal'}</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
            }
