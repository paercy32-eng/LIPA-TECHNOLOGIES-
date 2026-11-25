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
  const [depositStep, setDepositStep] = useState(1);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isBindOpen, setIsBindOpen] = useState(false);
  
  const [depositAmount, setDepositAmount] = useState("");
  const [depositPhone, setDepositPhone] = useState("");
  const [txId, setTxId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  
  const [bindName, setBindName] = useState("");
  const [bindPhone, setBindPhone] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [copied, setCopied] = useState(false);

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
        setDepositPhone(phone); 
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
        router.push("/auth"); 
      }
    };
    getUser();
  }, [router]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBindSubmit = async () => {
    if (!bindName || !bindPhone) return setMessage({ text: "Please fill all fields", isError: true });
    if (bindPhone.length < 9) return setMessage({ text: "Invalid phone number", isError: true });

    setIsProcessing(true);
    const { error } = await supabase.from("profiles").update({ full_name: bindName, bound_number: bindPhone }).eq("id", userId);
    setIsProcessing(false);
    
    if (error) setMessage({ text: error.message, isError: true });
    else {
      setFullName(bindName);
      setBoundNumber(bindPhone);
      setIsBindOpen(false);
      alert("Account bound successfully!");
    }
  };

  const proceedToPayment = () => {
    if (numericAmount < 15000) return setMessage({ text: "Minimum deposit is 15,000 UGX", isError: true });
    if (!depositPhone || depositPhone.length < 9) return setMessage({ text: "Please enter a valid phone number", isError: true });
    setMessage({ text: "", isError: false });
    setDepositStep(2);
  };

  const handleDepositSubmit = async () => {
    if (!txId || txId.length < 5) return setMessage({ text: "Please enter a valid Transaction ID", isError: true });

    setIsProcessing(true);
    setMessage({ text: "", isError: false });

    try {
      const cleanTxId = txId.trim().toUpperCase();
      const { data: existingTx } = await supabase.from("transactions").select("id").eq("tx_id", cleanTxId).maybeSingle();
      if (existingTx) {
        setIsProcessing(false);
        return setMessage({ text: "This Transaction ID has already been submitted.", isError: true });
      }

      const { error } = await supabase.from("transactions").insert({
        user_id: userId,
        type: "DEPOSIT",
        amount: numericAmount,
        status: "PENDING",
        tx_id: cleanTxId,
        payment_phone: depositPhone
      });
      
      if (error) throw error;

      setIsDepositOpen(false);
      setDepositAmount("");
      setTxId("");
      setDepositStep(1);
      alert(`Deposit of UGX ${numericAmount.toLocaleString()} submitted! Please wait 5 to 30 minutes for admin to approve.`);
    } catch (error: any) {
      if (error.message.includes("idx_unique_tx_id")) {
        setMessage({ text: "This Transaction ID has already been used.", isError: true });
      } else {
        setMessage({ text: error.message, isError: true });
      }
    } finally {
      setIsProcessing(false);
    }
  };

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
      const { count: activeInv } = await supabase.from("investments").select("*", { count: 'exact', head: true }).eq("user_id", userId).eq("status", "ACTIVE");
      if (activeInv === 0) { setIsProcessing(false); return setMessage({ text: "You must have an active VIP to withdraw.", isError: true }); }

      const now = new Date();
      const eatTime = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Kampala', hour: 'numeric', hour12: false }).format(now);
      const currentHour = parseInt(eatTime);
      if (currentHour < 9 || currentHour >= 18) { setIsProcessing(false); return setMessage({ text: "Withdrawals allowed between 9:00 AM and 6:00 PM.", isError: true }); }

      const newBalance = Number(balance) - amount;
      await supabase.from("balances").update({ available: newBalance }).eq("user_id", userId);
      await supabase.from("transactions").insert({ user_id: userId, type: "WITHDRAWAL", amount: amount, status: "PENDING" });

      setBalance(newBalance.toString());
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      alert(`Withdrawal submitted! You will receive UGX ${(amount * 0.85).toLocaleString()} to ${boundNumber}.`);

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
    <div className="min-h-screen bg-[#F0F9FF] text-gray-900 p-5 pb-24">
      <div className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-orange-400 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-orange-500/30">N</div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-wide">Profile</h1>
            <p className="text-[10px] text-cyan-600 font-bold tracking-widest uppercase">{displayName || userPhone}</p>
          </div>
        </div>
      </div>

      {/* Balance Card with Aqua Glow */}
      <div className="bg-white border border-white rounded-3xl p-6 mb-6 shadow-[0_8px_30px_rgba(37,99,235,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200 blur-3xl rounded-full opacity-40"></div>
        <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-2">Total Balance</p>
        <div className="flex items-baseline gap-2 mb-8 relative z-10">
          <span className="text-lg text-cyan-600 font-bold">UGX</span>
          <h2 className="text-5xl font-black text-gray-900 tracking-tight">{Number(balance).toLocaleString()}</h2>
        </div>
        <div className="flex gap-3 relative z-10">
          <button onClick={() => { setIsDepositOpen(true); setDepositStep(1); setMessage({text:"", isError:false}); }} className="flex-1 bg-[#FF6B00] hover:bg-[#E65A00] text-white font-bold py-3 rounded-xl transition shadow-lg shadow-[#FF6B00]/30 text-sm">Deposit</button>
          <button onClick={() => { setIsWithdrawOpen(true); setMessage({text:"", isError:false}); }} className="flex-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-800 font-bold py-3 rounded-xl transition text-sm shadow-sm">Withdraw</button>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/dashboard/history" className="w-full flex items-center justify-between bg-white border border-white p-4 rounded-2xl hover:bg-gray-50 transition group shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <span className="font-bold text-sm text-gray-800">Transaction history</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </Link>

        <button onClick={() => setIsBindOpen(true)} className="w-full flex items-center justify-between bg-white border border-white p-4 rounded-2xl hover:bg-gray-50 transition group shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
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

        <a href="https://t.me/Camara0899" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between bg-white border border-white p-4 rounded-2xl hover:bg-gray-50 transition group shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </div>
            <span className="font-bold text-sm text-gray-800">Customer Care</span>
          </div>
        </a>

        <a href="https://t.me/+n2_EjAka_f5iZTlk" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between bg-white border border-white p-4 rounded-2xl hover:bg-gray-50 transition group shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </div>
            <span className="font-bold text-sm text-gray-800">Join Telegram Group</span>
          </div>
        </a>
      </div>

      <button onClick={handleLogout} className="w-full mt-8 flex items-center justify-center gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl hover:bg-red-100 transition shadow-sm">
        <span className="font-bold text-red-500 tracking-widest uppercase text-sm">Log Out</span>
      </button>

      {/* --- MULTI-STEP DEPOSIT MODAL --- */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{depositStep === 1 ? "Deposit Amount" : "Payment Details"}</h3>
              <button onClick={() => setIsDepositOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>
            
            {message.text && <div className={`text-center p-3 mb-4 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{message.text}</div>}

            {depositStep === 1 ? (
              <>
                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Amount (UGX)</label>
                <input type="number" placeholder="Minimum 15,000" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold text-lg mb-4 focus:outline-none focus:border-[#FF6B00]" />
                
                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Phone Number to Pay From</label>
                <input type="tel" placeholder="e.g. 0700123456" value={depositPhone} onChange={(e) => setDepositPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold text-lg mb-4 focus:outline-none focus:border-[#FF6B00]" />
                
                {numericAmount > 0 && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-gray-600">Deposit Amount:</p>
                      <p className="text-sm font-bold text-gray-900">UGX {numericAmount.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-gray-600">TavuPay Fee (2%):</p>
                      <p className="text-sm font-bold text-red-500">+ UGX {fee.toLocaleString()}</p>
                    </div>
                    <div className="border-t border-orange-200 pt-2 flex justify-between items-center">
                      <p className="text-xs font-bold text-orange-800">Total to Pay:</p>
                      <p className="text-lg font-black text-[#FF6B00]">UGX {totalToPay.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <button onClick={proceedToPayment} className="w-full font-bold py-4 rounded-xl text-white bg-[#FF6B00] hover:bg-[#E65A00]">Confirm Amount</button>
              </>
            ) : (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Pay exactly this amount:</p>
                  <p className="text-2xl font-black text-gray-900 mb-3">UGX {totalToPay.toLocaleString()}</p>
                  
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">To this Number:</p>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-lg font-black text-gray-900">0707828822</p>
                    <button onClick={() => handleCopy("0707828822")} className="text-xs bg-gray-200 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-gray-300">
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Registered Name:</p>
                  <p className="text-sm font-bold text-blue-700">PETER KIREMBWE</p>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4 text-center">
                  <p className="text-xs text-orange-800">Dial <b className="text-gray-900 text-sm">*185*1#</b> and send <b className="text-gray-900">UGX {totalToPay.toLocaleString()}</b></p>
                </div>

                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Transaction ID</label>
                <input type="text" placeholder="Enter the ID from SMS" value={txId} onChange={(e) => setTxId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold text-lg mb-4 focus:outline-none focus:border-[#FF6B00]" />
                
                <button onClick={handleDepositSubmit} disabled={isProcessing} className="w-full font-bold py-4 rounded-xl text-white bg-[#FF6B00] hover:bg-[#E65A00] mb-4">
                  {isProcessing ? 'Submitting...' : 'Submit Deposit'}
                </button>
                
                <p className="text-[10px] text-center text-gray-500">Wait between 5 to 30 minutes for admin to approve.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- BIND ACCOUNT MODAL --- */}
      {isBindOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Bind Account</h3>
              <button onClick={() => setIsBindOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Full Names (as on Mobile Money)</label>
            <input type="text" placeholder="e.g. John Doe" value={bindName} onChange={(e) => setBindName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] text-gray-900 mb-4" />
            <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Mobile Money Number</label>
            <input type="tel" placeholder="e.g. 0700123456" value={bindPhone} onChange={(e) => setBindPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] text-gray-900 mb-6" />
            <button onClick={handleBindSubmit} disabled={isProcessing} className="w-full font-bold py-4 rounded-xl text-white bg-[#FF6B00] hover:bg-[#E65A00]">
              {isProcessing ? 'Saving...' : boundNumber ? 'Update Account' : 'Save Account'}
            </button>
          </div>
        </div>
      )}

      {/* --- WITHDRAW MODAL --- */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Withdraw Funds</h3>
              <button onClick={() => setIsWithdrawOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>
            
            {message.text && <div className={`text-center p-3 mb-4 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{message.text}</div>}

            {!boundNumber ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-4">You must bind an account before you can withdraw.</p>
                <button onClick={() => { setIsWithdrawOpen(false); setIsBindOpen(true); }} className="bg-[#FF6B00] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#E65A00]">Bind Account Now</button>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4">
                  <p className="text-xs text-blue-800">Withdrawing to: <b>{fullName}</b> ({boundNumber}). A fee of <b>15%</b> applies.</p>
                </div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Amount (UGX)</label>
                <input type="number" placeholder="Minimum 3,000" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold text-lg mb-2 focus:outline-none focus:border-[#FF6B00]" />
                <div className="flex justify-between items-center mb-6 px-1">
                  <p className="text-xs text-gray-500">Available: UGX {Number(balance).toLocaleString()}</p>
                  {withdrawAmount && <p className="text-xs text-green-600 font-bold">You Receive: UGX {(Number(withdrawAmount) * 0.85).toLocaleString()}</p>}
                </div>
                <button onClick={handleWithdrawSubmit} disabled={isProcessing} className="w-full font-bold py-4 rounded-xl text-white bg-[#FF6B00] hover:bg-[#E65A00]">{isProcessing ? 'Processing...' : 'Request Withdrawal'}</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
        }
