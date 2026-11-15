"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ALL 35 PRODUCTS FOR THE DROPDOWN ---
const PRODUCTS = [
  { id: "p1", name: "LipaVault", price: 10000, total: 25000 },
  { id: "p2", name: "LipaCore", price: 5000, total: 13000 },
  { id: "p3", name: "LipaShield", price: 50000, total: 75000 },
  { id: "p4", name: "LipaControl", price: 100000, total: 300000 },
  { id: "p5", name: "LipaCredit", price: 150000, total: 450000 },
  { id: "p6", name: "LipaDirect", price: 200000, total: 300000 },
  { id: "p7", name: "LipaOmni", price: 75000, total: 110000 },
  { id: "p8", name: "LipaAdmin", price: 20000, total: 50000 },
  { id: "p9", name: "LipaLedger", price: 50000, total: 80000 },
  { id: "p10", name: "LipaBridge", price: 180000, total: 400000 },
  { id: "p11", name: "LipaConnect", price: 250000, total: 500000 },
  { id: "p12", name: "LipaSDK", price: 500000, total: 100000 },
  { id: "p13", name: "LipaGateway", price: 800000, total: 2000000 },
  { id: "p14", name: "LipaX", price: 1000000, total: 3000000 },
  { id: "p15", name: "LipaDashboard", price: 2000000, total: 4500000 },
  { id: "p16", name: "LipaFlow", price: 5000, total: 10000 },
  { id: "p17", name: "LipaPulse", price: 10000, total: 15000 },
  { id: "p18", name: "LipaRewards", price: 25000, total: 50000 },
  { id: "p19", name: "LipaSub", price: 50000, total: 120000 },
  { id: "p20", name: "LipaSpend", price: 100000, total: 225000 },
  { id: "p21", name: "LipaSplit", price: 150000, total: 320000 },
  { id: "p22", name: "LipaPaylink", price: 250000, total: 630000 },
  { id: "p23", name: "LipaInvoice", price: 500000, total: 1950000 },
  { id: "p24", name: "LipaInsights", price: 1000000, total: 3000000 },
  { id: "p25", name: "LipaVirtual", price: 2000000, total: 5600000 },
  { id: "p26", name: "LipaTap", price: 5000, total: 10000 },
  { id: "p27", name: "LipaScan", price: 10000, total: 18000 },
  { id: "p28", name: "LipaGo", price: 25000, total: 40000 },
  { id: "p29", name: "LipaPocket", price: 50000, total: 80000 },
  { id: "p30", name: "LipaWallet", price: 75000, total: 120000 },
  { id: "p31", name: "LipaP2P", price: 100000, total: 160000 },
  { id: "p32", name: "LipaSoftPOS", price: 150000, total: 280000 },
  { id: "p33", name: "LipaTerminal", price: 250000, total: 400000 },
  { id: "p34", name: "LipaCheckout", price: 500000, total: 1000000 },
  { id: "p35", name: "LipaRegister", price: 1000000, total: 2000000 },
];

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalDeposited: 0, totalInvested: 0 });

  // --- GRANT PRODUCT MODAL STATE ---
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [grantUserId, setGrantUserId] = useState("");
  const [grantProductId, setGrantProductId] = useState("p1");
  const [grantReturn, setGrantReturn] = useState("25000");

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      
      if (profile?.is_admin) {
        setIsAdmin(true);
        await fetchAllData();
      }
      
      setIsLoading(false);
    };
    checkAdminAndFetch();
  }, []);

  const fetchAllData = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*, balances(available)").order("created_at", { ascending: false });
    if (profiles) setUsers(profiles);

    const { data: txs } = await supabase
      .from("transactions")
      .select("*, profiles(phone, full_name, bound_number)")
      .eq("type", "WITHDRAWAL")
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });
    if (txs) setWithdrawals(txs);

    const { count: userCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
    const { data: deposits } = await supabase.from("transactions").select("amount").eq("type", "DEPOSIT").eq("status", "COMPLETED");
    const { data: investments } = await supabase.from("investments").select("amount").eq("status", "ACTIVE");

    setStats({
      totalUsers: userCount || 0,
      totalDeposited: deposits?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0,
      totalInvested: investments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    });
  };

  // --- ACTION FUNCTIONS ---
  const handleAdjustBalance = async (userId: string, currentBalance: number) => {
    const newBalance = prompt("Enter new balance (UGX):", currentBalance.toString());
    if (newBalance === null) return;

    const { error } = await supabase.from("balances").update({ available: Number(newBalance) }).eq("user_id", userId);
    if (error) alert("Error: " + error.message);
    else {
      alert("Balance updated successfully!");
      fetchAllData();
    }
  };

  // Open the Grant Modal and set defaults
  const openGrantModal = (userId: string) => {
    setGrantUserId(userId);
    setGrantProductId("p1"); // Default to LipaVault
    setGrantReturn("25000");
    setIsGrantModalOpen(true);
  };

  // Handle the product selection change to auto-fill the expected return
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setGrantProductId(selectedId);
    
    const product = PRODUCTS.find(p => p.id === selectedId);
    if (product) setGrantReturn(product.total.toString());
  };

  // Submit the grant
  const confirmGrantProduct = async () => {
    if (!grantUserId || !grantProductId || !grantReturn) return;

    const { error } = await supabase.from("investments").insert({
      user_id: grantUserId,
      product_id: grantProductId,
      amount: 0, // 0 because it's granted by admin, not purchased
      expected_return: Number(grantReturn),
      status: "ACTIVE",
    });

    if (error) alert("Error granting product: " + error.message);
    else {
      alert("Product granted successfully! It will now appear on their Income page.");
      setIsGrantModalOpen(false);
      fetchAllData();
    }
  };

  const handleBanUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "BANNED" ? "ACTIVE" : "BANNED";
    const confirmAction = confirm(`Are you sure you want to change status to ${newStatus}?`);
    if (!confirmAction) return;

    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);
    if (error) alert("Error updating status: " + error.message);
    else {
      alert(`User is now ${newStatus}`);
      fetchAllData();
    }
  };

  const handleApproveWithdrawal = async (txId: string) => {
    if (!confirm("Approve this withdrawal? Mark as PAID.")) return;
    await supabase.from("transactions").update({ status: "COMPLETED" }).eq("id", txId);
    fetchAllData();
  };

  const handleRejectWithdrawal = async (txId: string, userId: string, amount: number) => {
    if (!confirm("Reject this withdrawal? The amount will be refunded to the user's balance.")) return;
    await supabase.from("transactions").update({ status: "REJECTED" }).eq("id", txId);
    
    const { data: bal } = await supabase.from("balances").select("available").eq("user_id", userId).single();
    if (bal) {
      const newBalance = Number(bal.available) + Number(amount);
      await supabase.from("balances").update({ available: newBalance }).eq("user_id", userId);
    }
    fetchAllData();
  };

  // --- LOADING & ACCESS SCREENS ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#7B61FF] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-gray-400">Verifying Admin Access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0C10] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mb-6 border border-red-900/50">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 max-w-xs mb-8">You do not have administrator privileges to view this page.</p>
        <button onClick={() => router.push("/dashboard/home")} className="bg-[#7B61FF] hover:bg-[#6a52df] text-white font-bold py-3 px-8 rounded-xl transition">Return to App</button>
      </div>
    );
  }

  // --- MAIN ADMIN PANEL ---
  return (
    <div className="min-h-screen bg-[#0B0C10] text-white pb-10">
      <div className="bg-[#12141D] p-5 border-b border-gray-800 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-extrabold text-red-500 tracking-tight">ADMIN PANEL</h1>
        </div>
        <button onClick={() => router.push("/dashboard/home")} className="text-xs bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">Exit</button>
      </div>

      <div className="flex space-x-2 p-4 overflow-x-auto">
        {["OVERVIEW", "USERS", "WITHDRAWALS"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? "bg-[#7B61FF] text-white" : "bg-[#12141D] text-gray-400 border border-gray-800"}`}>{tab}</button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* OVERVIEW TAB */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-4">
            <div className="bg-[#12141D] p-5 rounded-2xl border border-gray-800"><p className="text-gray-400 text-xs font-bold uppercase">Total Users</p><h2 className="text-3xl font-black">{stats.totalUsers}</h2></div>
            <div className="bg-[#12141D] p-5 rounded-2xl border border-green-900/50"><p className="text-green-500 text-xs font-bold uppercase">Total Deposited</p><h2 className="text-3xl font-black">UGX {stats.totalDeposited.toLocaleString()}</h2></div>
            <div className="bg-[#12141D] p-5 rounded-2xl border border-[#7B61FF]/50"><p className="text-[#7B61FF] text-xs font-bold uppercase">Total Invested</p><h2 className="text-3xl font-black">UGX {stats.totalInvested.toLocaleString()}</h2></div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "USERS" && (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className={`bg-[#12141D] border ${user.status === 'BANNED' ? 'border-red-900/50' : 'border-gray-800'} p-4 rounded-2xl`}>
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-white">{user.phone}</p>
                    <p className="text-[10px] text-gray-500">Name: {user.full_name || "Not bound"}</p>
                    <p className="text-xs text-[#00D2FF]">Acc: {user.bound_number || "Not bound"}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${user.status === 'BANNED' ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                    {user.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="bg-[#0B0C10] p-3 rounded-xl mb-4 flex justify-between items-center">
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Balance</p>
                  <p className="text-sm font-black text-white">UGX {Number(user.balances?.[0]?.available || 0).toLocaleString()}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleAdjustBalance(user.id, user.balances?.[0]?.available || 0)} 
                    className="text-[10px] bg-blue-900/30 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-900/50 hover:bg-blue-900/50"
                  >
                    Adjust Balance
                  </button>
                  
                  <button 
                    onClick={() => openGrantModal(user.id)} 
                    className="text-[10px] bg-[#7B61FF]/20 text-[#7B61FF] px-3 py-1.5 rounded-lg border border-[#7B61FF]/50 hover:bg-[#7B61FF]/30"
                  >
                    Grant Product
                  </button>
                  
                  <button 
                    onClick={() => handleBanUser(user.id, user.status || 'ACTIVE')} 
                    className="text-[10px] bg-red-900/30 text-red-400 px-3 py-1.5 rounded-lg border border-red-900/50 hover:bg-red-900/50"
                  >
                    {user.status === 'BANNED' ? 'Unban User' : 'Ban User'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WITHDRAWALS TAB */}
        {activeTab === "WITHDRAWALS" && (
          <div className="space-y-3">
            {withdrawals.length === 0 ? <p className="text-center text-gray-500 mt-10">No pending withdrawals.</p> : (
              withdrawals.map((w) => (
                <div key={w.id} className="bg-[#12141D] border border-gray-800 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-bold text-white">{w.profiles?.full_name || w.profiles?.phone}</p>
                      <p className="text-xs text-[#00D2FF]">{w.profiles?.bound_number}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{new Date(w.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-black text-red-400">UGX {Number(w.amount).toLocaleString()}</h3>
                      <p className="text-[10px] text-green-400">Net: UGX {(Number(w.amount) * 0.85).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleApproveWithdrawal(w.id)} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-xl text-sm">Mark Paid</button>
                    <button onClick={() => handleRejectWithdrawal(w.id, w.user_id, w.amount)} className="flex-1 bg-red-900/50 hover:bg-red-900 text-red-200 font-bold py-2 rounded-xl text-sm">Reject & Refund</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* --- GRANT PRODUCT MODAL --- */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141D] border border-gray-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Grant Product</h3>
              <button onClick={() => setIsGrantModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Select Product</label>
            <select 
              value={grantProductId} 
              onChange={handleProductChange}
              className="w-full px-4 py-3 bg-[#0B0C10] border border-gray-700 rounded-xl focus:outline-none focus:border-[#7B61FF] text-white mb-4"
            >
              {PRODUCTS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.price.toLocaleString()} UGX)
                </option>
              ))}
            </select>

            <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Expected Return (UGX)</label>
            <input 
              type="number" 
              value={grantReturn}
              onChange={(e) => setGrantReturn(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B0C10] border border-gray-700 rounded-xl focus:outline-none focus:border-[#7B61FF] text-white font-bold mb-6"
            />

            <button onClick={confirmGrantProduct} className="w-full font-bold py-4 rounded-xl text-white bg-[#7B61FF] hover:bg-[#6a52df]">
              Confirm Grant
            </button>
          </div>
        </div>
      )}
    </div>
  );
                                                              }
