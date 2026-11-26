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
      if (!user) return router.push("/");

      const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (data) setTransactions(data);
      setIsLoading(false);
    };
    fetchHistory();
  }, [router]);

  const deposits = transactions.filter(t => t.type === "DEPOSIT");
  const withdrawals = transactions.filter(t => t.type === "WITHDRAWAL");
  const commissions = transactions.filter(t => t.type === "COMMISSION");
  const dailyEarnings = transactions.filter(t => t.type === "DAILY_EARNING");

  const getFilteredData = () => {
    if (activeTab === "DEPOSITS") return deposits;
    if (activeTab === "WITHDRAWALS") return withdrawals;
    if (activeTab === "COMMISSIONS") return commissions;
    if (activeTab === "DAILY_EARNINGS") return dailyEarnings;
    return [];
  };

  const getStatusDisplay = (status: string, type: string) => {
    if (status === "PENDING") return { text: "Pending", color: "text-orange-500 bg-orange-50 border-orange-100" };
    if (status === "FAILED") return { text: "Failed", color: "text-red-500 bg-red-50 border-red-100" };
    if (status === "REJECTED") return { text: "Rejected", color: "text-red-500 bg-red-50 border-red-100" };
    if (status === "COMPLETED") {
      if (type === "WITHDRAWAL") return { text: "Paid", color: "text-green-600 bg-green-50 border-green-100" };
      return { text: "Successful", color: "text-green-600 bg-green-50 border-green-100" };
    }
    return { text: status, color: "text-gray-500 bg-gray-50 border-gray-200" };
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
    <div className="min-h-screen bg-[#f0f9ff] text-gray-900 p-5 pb-24">
      <div className="mb-6 pt-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Transaction History</h1>
        <p className="text-gray-500 text-sm mt-1">Track all your account activity</p>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar">
        {["DEPOSITS", "WITHDRAWALS", "DAILY_EARNINGS", "COMMISSIONS"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 whitespace-nowrap rounded-xl font-bold text-xs transition-all ${
              activeTab === tab 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center text-blue-500 font-bold mt-10">Loading history...</div>
      ) : getFilteredData().length === 0 ? (
        <div className="text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mt-10">
          <p className="text-gray-400 text-sm font-medium">No {activeTab.toLowerCase().replace('_', ' ')} found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {getFilteredData().map((tx) => {
            const status = getStatusDisplay(tx.status, tx.type);
            return (
              <div key={tx.id} className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{getTransactionLabel(tx.type)}</p>
                  <p className="text-[10px] text-gray-500 mt-1 font-medium">{new Date(tx.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${tx.type === 'WITHDRAWAL' ? 'text-red-500' : 'text-cyan-600'}`}>
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