"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Real Data States
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalDeposited: 0, totalInvested: 0 });

  // 1. Verify Admin & Fetch Initial Data
  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/");
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        alert("Access Denied: You are not an admin.");
        router.push("/dashboard/home");
        return;
      }

      setAdminUser(user);
      await fetchAllData();
      setIsLoading(false);
    };

    checkAdminAndFetch();
  }, [router]);

  // 2. Fetch all data
  const fetchAllData = async () => {
    // Fetch Users & Balances
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*, balances(available, total_commission)")
      .order("created_at", { ascending: false });
      
    if (profiles) setUsers(profiles);

    // Fetch Pending Withdrawals
    const { data: txs } = await supabase
      .from("transactions")
      .select("*, profiles(phone)")
      .eq("type", "WITHDRAWAL")
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });
      
    if (txs) setWithdrawals(txs);

    // Fetch Stats
    const { count: userCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
    
    const { data: deposits } = await supabase.from("transactions").select("amount").eq("type", "DEPOSIT").eq("status", "COMPLETED");
    const totalDep = deposits?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    const { data: investments } = await supabase.from("investments").select("amount").eq("status", "ACTIVE");
    const totalInv = investments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    setStats({
      totalUsers: userCount || 0,
      totalDeposited: totalDep,
      totalInvested: totalInv
    });
  };

  // 3. Admin Actions
  const handleApproveWithdrawal = async (txId: string) => {
    if (!confirm("Approve this withdrawal? This will mark it as COMPLETED.")) return;
    
    const { error } = await supabase.from("transactions").update({ status: "COMPLETED" }).eq("id", txId);
    if (error) alert(error.message);
    else {
      alert("Withdrawal Approved!");
      fetchAllData(); // Refresh
    }
  };

  const handleAdjustBalance = async (userId: string, currentBalance: number) => {
    const newBalance = prompt("Enter new balance (UGX):", currentBalance.toString());
    if (newBalance === null) return;

    const { error } = await supabase.from("balances").update({ available: Number(newBalance) }).eq("user_id", userId);
    if (error) alert(error.message);
    else {
      alert("Balance updated!");
      fetchAllData();
    }
  };

  const handleBanUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "BANNED" ? "ACTIVE" : "BANNED";
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);
    if (error) alert(error.message);
    else {
      alert(`User is now ${newStatus}`);
      fetchAllData();
    }
  };

  const handleResetPassword = async (phone: string) => {
    if (!confirm(`Send password reset to ${phone}?`)) return;
    const email = `256${phone}@lipa.co`; // Reconstruct fake email
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) alert(error.message);
    else alert("Password reset email sent (to fake email). You will need to manually change their password in Supabase Auth dashboard if they are locked out.");
  };

  const handleGrantProduct = async (userId: string) => {
    const productName = prompt("Enter Product Name to Grant (e.g., LipaVault):");
    if (!productName) return;
    const amount = prompt("Enter Invested Amount:");
    if (!amount) return;

    // Note: In a full app, you'd look up the product ID. For now, we simulate.
    const { error } = await supabase.from("investments").insert({
      user_id: userId,
      amount: Number(amount),
      expected_return: Number(amount) * 2, // Example logic
      status: "ACTIVE"
    });

    if (error) alert(error.message);
    else {
      alert("Product Granted Successfully!");
      fetchAllData();
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white font-bold">Verifying Admin Access...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-10">
      {/* Header */}
      <div className="bg-[#121212] p-5 border-b border-gray-800 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-extrabold text-red-500 tracking-tight">ADMIN PANEL</h1>
          <p className="text-xs text-gray-400">LIPA Technologies</p>
        </div>
        <button 
          onClick={() => router.push("/dashboard/home")}
          className="text-xs bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-700"
        >
          Exit
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 p-4 overflow-x-auto">
        {["OVERVIEW", "USERS", "WITHDRAWALS"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        
        {/* OVERVIEW TAB */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-5 rounded-2xl">
              <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Users</p>
              <h2 className="text-3xl font-black text-white">{stats.totalUsers}</h2>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-green-900 p-5 rounded-2xl">
              <p className="text-green-500 text-xs font-bold uppercase mb-1">Total Deposited</p>
              <h2 className="text-3xl font-black text-white">UGX {stats.totalDeposited.toLocaleString()}</h2>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-blue-900 p-5 rounded-2xl">
              <p className="text-blue-500 text-xs font-bold uppercase mb-1">Total Invested</p>
              <h2 className="text-3xl font-black text-white">UGX {stats.totalInvested.toLocaleString()}</h2>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "USERS" && (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className={`bg-[#121212] border ${user.status === 'BANNED' ? 'border-red-900/50' : 'border-gray-800'} p-4 rounded-2xl`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-white">{user.phone}</p>
                    <p className="text-[10px] text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${user.status === 'BANNED' ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>
                    {user.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4 bg-black/40 p-2 rounded-xl">
                  <div>
                    <p className="text-[10px] text-gray-500">Balance</p>
                    <p className="text-sm font-bold text-white">UGX {(user.balances?.[0]?.available || 0).toLocaleString()}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleAdjustBalance(user.id, user.balances?.[0]?.available || 0)} className="text-[10px] bg-blue-900/30 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-900/50">Adjust Balance</button>
                  <button onClick={() => handleGrantProduct(user.id)} className="text-[10px] bg-purple-900/30 text-purple-400 px-3 py-1.5 rounded-lg border border-purple-900/50">Grant Product</button>
                  <button onClick={() => handleResetPassword(user.phone)} className="text-[10px] bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700">Reset PW</button>
                  <button onClick={() => handleBanUser(user.id, user.status)} className="text-[10px] bg-red-900/30 text-red-400 px-3 py-1.5 rounded-lg border border-red-900/50">
                    {user.status === 'BANNED' ? 'Unban' : 'Ban User'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WITHDRAWALS TAB */}
        {activeTab === "WITHDRAWALS" && (
          <div className="space-y-3">
            {withdrawals.length === 0 ? (
              <p className="text-center text-gray-500 mt-10 text-sm">No pending withdrawals.</p>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="bg-[#121212] border border-gray-800 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-bold text-white">{w.profiles?.phone || "Unknown"}</p>
                      <p className="text-[10px] text-gray-500">{new Date(w.created_at).toLocaleString()}</p>
                    </div>
                    <h3 className="text-xl font-black text-red-400">UGX {Number(w.amount).toLocaleString()}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveWithdrawal(w.id)} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-xl text-sm transition">Approve</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
        }
