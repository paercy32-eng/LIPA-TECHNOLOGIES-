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
  const [depositStep, setDepositStep] = useState(1);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isBindOpen, setIsBindOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false); 
  
  // Form States
  const [depositAmount, setDepositAmount] = useState("");
  const [depositPhone, setDepositPhone] = useState("");
  const [txId, setTxId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  
  // Bind Form State
  const [bindName, setBindName] = useState("");
  const [bindPhone, setBindPhone] = useState("");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [copied, setCopied] = useState(false);

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

  // --- DEPOSIT LOGIC (MANUAL) ---
  const proceedToPayment = () => {
    const amount = Number(depositAmount);
    if (amount < 5000) return setMessage({ text: "Minimum deposit is 5,000 UGX", isError: true });
    if (!depositPhone || depositPhone.length < 9) return setMessage({ text: "Please enter a valid phone number", isError: true });
    setMessage({ text: "", isError: false });
    setDepositStep(2);
  };

  const handleDepositSubmit = async () => {
    if (!txId || txId.length < 5) return setMessage({ text: "Please enter a valid Transaction ID", isError: true });

    setIsProcessing(true);
    setMessage({ text: "", isError: false });

    try {
      const { error } = await supabase.from("transactions").insert({
        user_id: userId,
        type: "DEPOSIT",
        amount: Number(depositAmount),
        status: "PENDING",
        tx_id: txId,
        payment_phone: depositPhone
      });
      
      if (error) throw error;

      setIsDepositOpen(false);
      setDepositAmount("");
      setTxId("");
      setDepositStep(1);
      alert("Deposit submitted! Please wait 5 to 30 minutes for admin approval.");
    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
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
      if (activeInv === 0) { setIsProcessing(false); return setMessage({ text: "You must have an active product to withdraw.", isError: true }); }

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
    <div className="min-h-screen bg-[#0B0C10] text-white p-5 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#7B61FF] rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-[0_0_15px_rgba(123,97,255,0.4)]">LP</div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">Profile</h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{displayName || userPhone}</p>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-[#12141D] border border-gray-800 rounded-3xl p-6 mb-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#7B61FF]/10 blur-3xl rounded-full"></div>
        <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mb-2">Total Balance</p>
        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-lg text-[#00D2FF] font-bold">UGX</span>
          <h2 className="text-5xl font-black text-white tracking-tight">{Number(balance).toLocaleString()}</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setIsDepositOpen(true); setDepositStep(1); setMessage({text:"", isError:false}); }} className="flex-1 bg-[#7B61FF] hover:bg-[#6a52df] text-white font-bold py-3 rounded-xl transition shadow-[0_5px_15px_rgba(123,97,255,0.3)] text-sm">Deposit</button>
          <button onClick={() => { setIsWithdrawOpen(true); setMessage({text:"", isError:false}); }} className="flex-1 bg-[#1A1D27] hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition text-sm border border-gray-700">Withdraw</button>
        </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <Link href="/dashboard/history" className="w-full flex items-center justify-between bg-[#12141D] border border-gray-800 p-4 rounded-2xl hover:bg-gray-800 transition group shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#00D2FF]/10 rounded-xl flex items-center justify-center text-[#00D2FF]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <span className="font-bold text-sm text-gray-200">Transaction history</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </Link>

        <button onClick={() => setIsBindOpen(true)} className="w-full flex items-center justify-between bg-[#12141D] border border-gray-800 p-4 rounded-2xl hover:bg-gray-800 transition group shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div className="text-left">
              <span className="font-bold text-sm text-gray-200 block">Bind Account</span>
              <span className="text-xs text-gray-500">{boundNumber ? `Bound to ${boundNumber}` : "Not bound"}</span>
            </div>
          </div>
        </button>

        <button onClick={() => setIsWhatsAppOpen(true)} className="w-full flex items-center justify-between bg-[#12141D] border border-gray-800 p-4 rounded-2xl hover:bg-gray-800 transition group shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </div>
            <span className="font-bold text-sm text-gray-200">Join WhatsApp Groups</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>

        <a href="https://t.me/+oj-FvpQ1jhozODA8" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between bg-[#12141D] border border-gray-800 p-4 rounded-2xl hover:bg-gray-800 transition group shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </div>
            <span className="font-bold text-sm text-gray-200">Join Telegram Group</span>
          </div>
        </a>
      </div>

      <button onClick={handleLogout} className="w-full mt-8 flex items-center justify-center gap-3 bg-red-900/20 border border-red-900/50 p-4 rounded-2xl hover:bg-red-900/40 transition">
        <span className="font-bold text-red-400 tracking-widest uppercase text-sm">Log Out</span>
      </button>

      {/* --- MULTI-STEP DEPOSIT MODAL --- */}
      {isDepositOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141D] border border-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{depositStep === 1 ? "Deposit Amount" : "Payment Details"}</h3>
              <button onClick={() => setIsDepositOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            {message.text && <div className={`text-center p-3 mb-4 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-900/30 text-red-400 border-red-900/50' : 'bg-green-900/30 text-green-400 border-green-900/50'}`}>{message.text}</div>}

            {depositStep === 1 ? (
              <>
                <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Amount (UGX)</label>
                <input type="number" placeholder="Minimum 5,000" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full px-4 py-3 bg-[#0B0C10] border border-gray-700 rounded-xl text-white font-bold text-lg mb-4 focus:outline-none focus:border-[#7B61FF]" />
                
                <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Phone Number to Pay From</label>
                <input type="tel" placeholder="e.g. 0700123456" value={depositPhone} onChange={(e) => setDepositPhone(e.target.value)} className="w-full px-4 py-3 bg-[#0B0C10] border border-gray-700 rounded-xl text-white font-bold text-lg mb-6 focus:outline-none focus:border-[#7B61FF]" />
                
                <button onClick={proceedToPayment} className="w-full font-bold py-4 rounded-xl text-white bg-[#7B61FF] hover:bg-[#6a52df]">Confirm Amount</button>
              </>
            ) : (
              <>
                <div className="bg-[#0B0C10] border border-gray-700 rounded-xl p-4 mb-4">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Pay to this Number</p>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-lg font-black text-white">0707828822</p>
                    <button onClick={() => handleCopy("0707828822")} className="text-xs bg-gray-800 text-[#00D2FF] px-3 py-1.5 rounded-lg border border-gray-700">
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Registered Name</p>
                  <p className="text-sm font-bold text-[#00D2FF]">PETER KIREMBWE</p>
                </div>

                <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-3 mb-4 text-center">
                  <p className="text-xs text-blue-200">Dial <b className="text-white text-sm">*185*1#</b> to deposit exactly <b className="text-white">UGX {Number(depositAmount).toLocaleString()}</b></p>
                </div>

                <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Transaction ID</label>
                <input type="text" placeholder="Enter the ID from SMS" value={txId} onChange={(e) => setTxId(e.target.value)} className="w-full px-4 py-3 bg-[#0B0C10] border border-gray-700 rounded-xl text-white font-bold text-lg mb-4 focus:outline-none focus:border-[#7B61FF]" />
                
                <button onClick={handleDepositSubmit} disabled={isProcessing} className="w-full font-bold py-4 rounded-xl text-white bg-[#7B61FF] hover:bg-[#6a52df] mb-4">
                  {isProcessing ? 'Submitting...' : 'Submit Deposit'}
                </button>
                
                <p className="text-[10px] text-center text-gray-500">Wait between 5 to 30 minutes for admin to approve.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- WHATSAPP GROUPS MODAL --- */}
      {isWhatsAppOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141D] border border-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Join WhatsApp</h3>
              <button onClick={() => setIsWhatsAppOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <p className="text-sm text-gray-400 mb-6 text-center">Select a group to join below:</p>
            <div className="space-y-3">
              <a href="https://chat.whatsapp.com/Lo2qmclH4Vf6nvViguQO5w?s=cl&p=a&iam=2" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl transition shadow-lg shadow-[#25D366]/20">Group 1</a>
              <a href="https://chat.whatsapp.com/K7VPMO3ux3r1ih9MR3KM0v?s=cl&p=a&iam=2" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl transition shadow-lg shadow-[#25D366]/20">Group 2</a>
            </div>
          </div>
        </div>
      )}

      {/* --- BIND ACCOUNT MODAL --- */}
      {isBindOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141D] border border-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Bind Account</h3>
              <button onClick={() => setIsBindOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Full Names (as on Mobile Money)</label>
            <input type="text" placeholder="e.g. John Doe" value={bindName} onChange={(e) => setBindName(e.target.value)} className="w-full px-4 py-3 bg-[#0B0C10] border border-gray-700 rounded-xl focus:outline-none focus:border-[#7B61FF] text-white mb-4" />
            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Mobile Money Number</label>
            <input type="tel" placeholder="e.g. 0700123456" value={bindPhone} onChange={(e) => setBindPhone(e.target.value)} className="w-full px-4 py-3 bg-[#0B0C10] border border-gray-700 rounded-xl focus:outline-none focus:border-[#7B61FF] text-white mb-6" />
            <button onClick={handleBindSubmit} disabled={isProcessing} className="w-full font-bold py-4 rounded-xl text-white bg-[#7B61FF] hover:bg-[#6a52df]">
              {isProcessing ? 'Saving...' : boundNumber ? 'Update Account' : 'Save Account'}
            </button>
          </div>
        </div>
      )}

      {/* --- WITHDRAW MODAL --- */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141D] border border-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
              <button onClick={() => setIsWithdrawOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            {message.text && <div className={`text-center p-3 mb-4 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-900/30 text-red-400 border-red-900/50' : 'bg-green-900/30 text-green-400 border-green-900/50'}`}>{message.text}</div>}

            {!boundNumber ? (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm mb-4">You must bind an account before you can withdraw.</p>
                <button onClick={() => { setIsWithdrawOpen(false); setIsBindOpen(true); }} className="bg-[#7B61FF] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#6a52df]">Bind Account Now</button>
              </div>
            ) : (
              <>
                <div className="bg-[#00D2FF]/10 border border-[#00D2FF]/20 p-3 rounded-xl mb-4">
                  <p className="text-xs text-[#00D2FF]">Withdrawing to: <b>{fullName}</b> ({boundNumber}). A fee of <b>15%</b> applies.</p>
                </div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Amount (UGX)</label>
                <input type="number" placeholder="Minimum 3,000" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full px-4 py-3 bg-[#0B0C10] border border-gray-700 rounded-xl text-white font-bold text-lg mb-2 focus:outline-none focus:border-[#7B61FF]" />
                <div className="flex justify-between items-center mb-6 px-1">
                  <p className="text-xs text-gray-500">Available: UGX {Number(balance).toLocaleString()}</p>
                  {withdrawAmount && <p className="text-xs text-green-400 font-bold">You Receive: UGX {(Number(withdrawAmount) * 0.85).toLocaleString()}</p>}
                </div>
                <button onClick={handleWithdrawSubmit} disabled={isProcessing} className="w-full font-bold py-4 rounded-xl text-white bg-[#7B61FF] hover:bg-[#6a52df]">{isProcessing ? 'Processing...' : 'Request Withdrawal'}</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
  }
