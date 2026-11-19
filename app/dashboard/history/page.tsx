"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HistoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("DEPOSITS");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth");

      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setTransactions(data);
      setIsLoading(false);
    };
    fetchHistory();
  }, [router]);

  const deposits = transactions.filter(t => t.type === "DEPOSIT");
  const withdrawals = transactions.filter(t => t.type === "WITHDRAWAL");
  const commissions = transactions.filter(t => t.type === "COMMISSION");
  const dailyEarnings = transactions.filter(t => t.type === "DAILY_EARNING"); // NEW

  const getFilteredData = () => {
    if (activeTab === "DEPOSITS") return deposits;
    if (activeTab === "WITHDRAWALS") return withdrawals;
    if (activeTab === "COMMISSIONS") return commissions;
    if (activeTab === "DAILY_EARNINGS") return dailyEarnings;
    return [];
  };

  const getStatusDisplay = (status: string, type: string) => {
    if (status === "PENDING") return { text: "Pending", color: "text-orange-400 bg-orange-900/30 border-orange-900/50" };
    if (status === "FAILED") return { text: "Failed", color: "text-red-400 bg-red-900/30 border-red-900/50" };
    if (status === "REJECTED") return { text: "Rejected", color: "text-red-400 bg-red-900/30 border-red-900/50" };
    if (status === "COMPLETED") {
      if (type === "WITHDRAWAL") return { text: "Paid", color: "text-green-400 bg-green-900/30 border-green-900/50" };
      return { text: "Successful", color: "text-green-400 bg-green-900/30 border-green-900/50" };
    }
    return { text: status, color: "text-gray-400 bg-gray-900/30 border-gray-800" };
  };

  const getTransactionLabel = (type: string) => {
    if (type === "DEPOSIT") return "Deposit";
    if (type === "WITHDRAWAL") return "Withdrawal";
    if (type === "COMMISSION") return "Referral Commission";
    if (type === "DAILY_EARNING") return "Daily Earning";
    if (type === "ADMIN_ADJUSTMENT") return "Admin Adjustment";
    return type;
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white p-5 pb-24">
      
      {/* Header */}
      <div className="mb-6 pt-4">
        <h1 className="text-2xl font-black text-white tracking-tight">Transaction History</h1>
        <p className="text-gray-400 text-sm mt-1">Track all your account activity</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar">
        {["DEPOSITS", "WITHDRAWALS", "DAILY_EARNINGS", "COMMISSIONS"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 whitespace-nowrap rounded-xl font-bold text-xs transition-all ${
              activeTab === tab 
                ? "bg-[#7B61FF] text-white shadow-[0_5px_15px_rgba(123,97,255,0.4)]" 
                : "bg-[#12141D] text-gray-400 border border-gray-800 hover:bg-gray-800"
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 mt-10">Loading history...</div>
      ) : getFilteredData().length === 0 ? (
        <div className="text-center bg-[#12141D] p-8 rounded-3xl border border-gray-800 shadow-lg mt-10">
          <div className="w-16 h-16 bg-[#7B61FF]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#7B61FF]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-gray-400 text-sm font-medium">No {activeTab.toLowerCase().replace('_', ' ')} found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {getFilteredData().map((tx) => {
            const status = getStatusDisplay(tx.status, tx.type);
            return (
              <div key={tx.id} className="bg-[#12141D] border border-gray-800 p-4 rounded-2xl flex justify-between items-center shadow-lg">
                <div>
                  <p className="font-bold text-white text-sm capitalize">
                    {getTransactionLabel(tx.type)}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1 font-medium">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${tx.type === 'WITHDRAWAL' ? 'text-red-400' : 'text-[#00D2FF]'}`}>
                    {tx.type === 'WITHDRAWAL' ? '-' : '+'} UGX {Number(tx.amount).toLocaleString()}
                  </p>
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border mt-1 inline-block ${status.color}`}>
                    {status.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  }
