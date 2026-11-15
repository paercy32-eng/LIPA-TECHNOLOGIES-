"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("DEPOSITS");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setTransactions(data);
      setIsLoading(false);
    };
    fetchHistory();
  }, []);

  const deposits = transactions.filter(t => t.type === "DEPOSIT");
  const withdrawals = transactions.filter(t => t.type === "WITHDRAWAL");
  const commissions = transactions.filter(t => t.type === "COMMISSION");

  const getFilteredData = () => {
    if (activeTab === "DEPOSITS") return deposits;
    if (activeTab === "WITHDRAWALS") return withdrawals;
    return commissions;
  };

  // Helper to format status
  const getStatusDisplay = (status: string, type: string) => {
    if (status === "PENDING") return { text: "Pending", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" };
    if (status === "FAILED") return { text: "Failed", color: "text-red-400 bg-red-400/10 border-red-400/20" };
    if (status === "REJECTED") return { text: "Rejected", color: "text-red-400 bg-red-400/10 border-red-400/20" };
    if (status === "COMPLETED") {
      if (type === "WITHDRAWAL") return { text: "Paid", color: "text-green-400 bg-green-400/10 border-green-400/20" };
      return { text: "Successful", color: "text-green-400 bg-green-400/10 border-green-400/20" };
    }
    return { text: status, color: "text-gray-400 bg-gray-400/10 border-gray-400/20" };
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-5 pb-24">
      <div className="mb-6 pt-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Transaction History</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {["DEPOSITS", "WITHDRAWALS", "COMMISSIONS"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab ? "bg-green-600 text-white" : "bg-[#121212] text-gray-400 border border-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 mt-10">Loading history...</div>
      ) : getFilteredData().length === 0 ? (
        <div className="text-center text-gray-500 mt-10 text-sm">No {activeTab.toLowerCase()} found.</div>
      ) : (
        <div className="space-y-3">
          {getFilteredData().map((tx) => {
            const status = getStatusDisplay(tx.status, tx.type);
            return (
              <div key={tx.id} className="bg-[#121212] border border-gray-800 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-white text-sm capitalize">{tx.type.toLowerCase()}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{new Date(tx.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${tx.type === 'WITHDRAWAL' ? 'text-red-400' : 'text-green-400'}`}>
                    {tx.type === 'WITHDRAWAL' ? '-' : '+'} UGX {Number(tx.amount).toLocaleString()}
                  </p>
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${status.color}`}>
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
