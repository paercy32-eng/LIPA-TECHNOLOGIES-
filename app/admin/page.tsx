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
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalDeposited: 0, totalInvested: 0 });

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth"); // CHANGED TO /auth

      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (!profile?.is_admin) {
        alert("Access Denied");
        return router.push("/dashboard/home");
      }

      await fetchAllData();
      setIsLoading(false);
    };
    checkAdminAndFetch();
  }, [router]);

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

  if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Verifying Admin...</div>;

  return (
    <div className="min-h-screen bg-black text-white pb-10">
      <div className="bg-[#121212] p-5 border-b border-gray-800 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-extrabold text-red-500 tracking-tight">ADMIN PANEL</h1>
        </div>
        <button onClick={() => router.push("/dashboard/home")} className="text-xs bg-gray-800 px-3 py-1.5 rounded-lg">Exit</button>
      </div>

      <div className="flex space-x-2 p-4 overflow-x-auto">
        {["OVERVIEW", "USERS", "WITHDRAWALS"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400"}`}>{tab}</button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {activeTab === "OVERVIEW" && (
          <div className="space-y-4">
            <div className="bg-gray-900 p-5 rounded-2xl border border-gray-700"><p className="text-gray-400 text-xs font-bold uppercase">Total Users</p><h2 className="text-3xl font-black">{stats.totalUsers}</h2></div>
            <div className="bg-gray-900 p-5 rounded-2xl border border-green-900"><p className="text-green-500 text-xs font-bold uppercase">Total Deposited</p><h2 className="text-3xl font-black">UGX {stats.totalDeposited.toLocaleString()}</h2></div>
            <div className="bg-gray-900 p-5 rounded-2xl border border-blue-900"><p className="text-blue-500 text-xs font-bold uppercase">Total Invested</p><h2 className="text-3xl font-black">UGX {stats.totalInvested.toLocaleString()}</h2></div>
          </div>
        )}

        {activeTab === "USERS" && (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="bg-[#121212] border border-gray-800 p-4 rounded-2xl">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-white">{user.phone}</p>
                    <p className="text-[10px] text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                    <p className="text-xs text-gray-400 mt-1">Name: {user.full_name || "Not bound"}</p>
                    <p className="text-xs text-gray-400">Acc: {user.bound_number || "Not bound"}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${user.status === 'BANNED' ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}>{user.status}</span>
                </div>
                <div className="bg-black/40 p-2 rounded-xl mb-3">
                  <p className="text-[10px] text-gray-500">Balance</p>
                  <p className="text-sm font-bold text-white">UGX {Number(user.balances?.[0]?.available || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "WITHDRAWALS" && (
          <div className="space-y-3">
            {withdrawals.length === 0 ? <p className="text-center text-gray-500 mt-10">No pending withdrawals.</p> : (
              withdrawals.map((w) => (
                <div key={w.id} className="bg-[#121212] border border-gray-800 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-bold text-white">{w.profiles?.full_name || w.profiles?.phone}</p>
                      <p className="text-xs text-[#00d2ff]">{w.profiles?.bound_number}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{new Date(w.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-black text-red-400">UGX {Number(w.amount).toLocaleString()}</h3>
                      <p className="text-[10px] text-green-400">Net: UGX {(Number(w.amount) * 0.87).toLocaleString()}</p>
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
    </div>
  );
}
