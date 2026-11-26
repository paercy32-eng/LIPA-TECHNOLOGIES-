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
  
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositStatus, setDepositStatus] = useState("");
  
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isBindOpen, setIsBindOpen] = useState(false);
  
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bindName, setBindName] = useState("");
  const [bindPhone, setBindPhone] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  const numericAmount = Number(depositAmount) || 0;
  const fee = numericAmount * 0.02;
  const totalToPay = numericAmount + fee;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const rawPhone = user.email.split('@')[0];
        const phone = rawPhone.startsWith("256") ? rawPhone.substring(3) : rawPhone;
        setUserPhone(phone);
        setUserId(user.id);

        const { data: profile } = await supabase.from("profiles").select("display_name, full_name, bound_number").eq("id", user.id).single();
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

  const handleDeposit = async () => {
    if (numericAmount < 15000) return setMessage({ text: "Minimum deposit is 15,000 UGX", isError: true });

    setIsDepositing(true);
    setDepositStatus("Initiating PesaJet prompt...");

    try {
      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount, phone: userPhone, userId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setDepositStatus("Check your phone and enter PIN...");

      // Poll PesaJet every 3 seconds
      const interval = setInterval(async () => {
        const statusRes = await fetch(`/api/deposit/status?reference=${data.reference}`);
        const statusData = await statusRes.json();

        if (statusData.status === "COMPLETED") {
          clearInterval(interval);
          setDepositStatus("Success! Balance credited.");
          setTimeout(() => {
            setIsDepositOpen(false);
            setIsDepositing(false);
            setDepositAmount("");
            window.location.reload(); // Reload to refresh balance
          }, 2000);
        } else if (statusData.status === "FAILED" || statusData.status === "EXPIRED") {
          clearInterval(interval);
          setDepositStatus("Payment failed or expired.");
          setIsDepositing(false);
        }
      }, 3000);

    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
      setIsDepositing(false);
      setDepositStatus("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); 
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-gray-900 p-5 pb-24">
      <div className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-blue-500/30">N</div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-wide">Profile</h1>
            <p className="text-[10px] text-cyan-600 font-bold tracking-widest uppercase">{displayName || userPhone}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-white rounded-3xl p-6 mb-6 shadow-[0_8px_30px_rgba(37,99,235,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200 blur-3xl rounded-full opacity-40"></div>
        <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-2">Total Balance</p>
        <div className="flex items-baseline gap-2 mb-8 relative z-10">
          <span className="text-lg text-cyan-600 font-bold">UGX</span>
          <h2 className="text-5xl font-black text-gray-900 tracking-tight">{Number(balance).toLocaleString()}</h2>
        </div>
        <div className="flex gap-3 relative z-10">
          <button onClick={() => { setIsDepositOpen(true); setMessage({text:"", isError:false}); setDepositStatus(""); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/30 text-sm">Deposit</button>
          <button onClick={() => { setIsWithdrawOpen(true); setMessage({text:"", isError:false}); }} className="flex-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-800 font-bold py-3 rounded-xl transition text-sm shadow-sm">Withdraw</button>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/dashboard/history" className="w-full flex items-center justify-between bg-white border border-white p-4 rounded-2xl hover:bg-gray-50 transition group shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <span className="font-bold text-sm text-gray-800">Transaction history</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </Link>

        <button onClick={() => setIsBindOpen(true)} className="w-full flex items-center justify-between bg-white border border-white p-4 rounded-2xl hover:bg-gray-50 transition group shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div className="text-left">
              <span className="font-bold text-sm text-gray-800 block">Bind Account</span>
              <span className="text-xs text-gray-500">{boundNumber ? `Bound to ${boundNumber}` : "Not bound"}</span>
            </div>
          </div>
        </button>

        <a href="https://t.me/Camara0899" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between bg-white border border-white p-4 rounded-2xl hover:bg-gray-50 transition group shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </div>
            <span className="font-bold text-sm text-gray-800">Customer Care</span>
          </div>
        </a>
      </div>

      <button onClick={handleLogout} className="w-full mt-8 flex items-center justify-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl hover:bg-red-100 transition shadow-sm">
        <span className="font-bold text-red-500 tracking-widest uppercase text-sm">Log Out</span>
      </button>

      {/* DEPOSIT MODAL */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Deposit Funds</h3>
              <button onClick={() => setIsDepositOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>
            
            {message.text && <div className={`text-center p-3 mb-4 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{message.text}</div>}

            {depositStatus ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-bold text-gray-800">{depositStatus}</p>
                <p className="text-xs text-gray-500 mt-2">Do not close this window.</p>
              </div>
            ) : (
              <>
                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Amount (UGX)</label>
                <input type="number" placeholder="Minimum 15,000" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold text-lg mb-4 focus:outline-none focus:border-blue-500" />
                
                {numericAmount > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-gray-600">TavuPay Fee (2%):</p>
                      <p className="text-sm font-bold text-red-500">+ UGX {fee.toLocaleString()}</p>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between items-center">
                      <p className="text-xs font-bold text-blue-800">Total to Pay:</p>
                      <p className="text-lg font-black text-blue-700">UGX {totalToPay.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <button onClick={handleDeposit} disabled={isDepositing} className="w-full font-bold py-4 rounded-xl text-white bg-blue-600 hover:bg-blue-700">
                  {isDepositing ? 'Processing...' : 'Confirm Deposit'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* BIND & WITHDRAW MODALS (Keep the same logic as before) */}
      {isBindOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Bind Account</h3>
              <button onClick={() => setIsBindOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>
            <input type="text" placeholder="Full Names" value={bindName} onChange={(e) => setBindName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl mb-4" />
            <input type="tel" placeholder="Mobile Money Number" value={bindPhone} onChange={(e) => setBindPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl mb-6" />
            <button onClick={async () => {
              await supabase.from("profiles").update({ full_name: bindName, bound_number: bindPhone }).eq("id", userId);
              setBoundNumber(bindPhone); setIsBindOpen(false); alert("Account bound!");
            }} className="w-full font-bold py-4 rounded-xl text-white bg-blue-600">Save Account</button>
          </div>
        </div>
      )}

      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Withdraw Funds</h3>
            {!boundNumber ? (
               <p className="text-sm text-gray-500 text-center">You must bind an account first.</p>
            ) : (
              <>
                <input type="number" placeholder="Minimum 3,000" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl mb-4" />
                <button onClick={async () => {
                  const amt = Number(withdrawAmount);
                  const newBal = Number(balance) - amt;
                  await supabase.from("balances").update({ available: newBal }).eq("user_id", userId);
                  await supabase.from("transactions").insert({ user_id: userId, type: "WITHDRAWAL", amount: amt, status: "PENDING" });
                  setBalance(newBal.toString()); setIsWithdrawOpen(false); alert("Withdrawal requested!");
                }} className="w-full font-bold py-4 rounded-xl text-white bg-blue-600">Request Withdrawal</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}