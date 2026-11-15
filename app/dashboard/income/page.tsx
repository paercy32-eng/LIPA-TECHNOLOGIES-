"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// We need product info to know the category and cycle
const productInfo: Record<string, any> = {
  "p1": { name: "LipaVault", category: "LOCK", cycleDays: 3, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400" },
  "p2": { name: "LipaCore", category: "LOCK", cycleDays: 3, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400" },
  "p16": { name: "LipaFlow", category: "DAILY_PAYOUT", cycleDays: 5, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400" },
  "p17": { name: "LipaPulse", category: "DAILY_PAYOUT", cycleDays: 3, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400" },
  "p26": { name: "LipaTap", category: "UNLOCK_24H", cycleDays: 4, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400" },
  "p27": { name: "LipaScan", category: "UNLOCK_24H", cycleDays: 4, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400" },
  // Add the rest of your 35 products here as needed
};

export default function IncomePage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const processedData = data.map(inv => {
          const info = productInfo[inv.product_id] || { name: "Unknown", category: "LOCK", cycleDays: 3, img: "" };
          
          const start = new Date(inv.created_at);
          const now = new Date();
          const hoursElapsed = (now.getTime() - start.getTime()) / (1000 * 60 * 60);

          let statusText = "";
          let statusColor = "text-gray-500";
          let timeText = "";

          if (info.category === "LOCK") {
            const days = Math.floor(hoursElapsed / 24);
            statusText = "Days Active";
            timeText = `${days} / ${info.cycleDays} Days`;
            statusColor = "text-blue-600";
          } else if (info.category === "DAILY_PAYOUT") {
            const nextPayout = 24 - (hoursElapsed % 24);
            statusText = "Next Payout";
            timeText = `in ${Math.floor(nextPayout)} hrs`;
            statusColor = "text-green-600";
          } else if (info.category === "UNLOCK_24H") {
            if (hoursElapsed < 24) {
              statusText = "Locked";
              timeText = `Unlocks in ${Math.floor(24 - hoursElapsed)} hrs`;
              statusColor = "text-red-500";
            } else {
              const nextPayout = 24 - (hoursElapsed % 24);
              statusText = "Next Payout";
              timeText = `in ${Math.floor(nextPayout)} hrs`;
              statusColor = "text-green-600";
            }
          }

          return { ...inv, ...info, statusText, statusColor, timeText };
        });
        setInvestments(processedData);
      }
      setIsLoading(false);
    };
    fetchInvestments();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 p-5 pb-24">
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Income</h1>
        <p className="text-gray-500 text-sm mt-1">Track your active investments</p>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 mt-10">Loading your portfolio...</div>
      ) : investments.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-gray-800 font-bold">No active investments</p>
          <p className="text-gray-500 text-sm mt-1">Go to Home and buy a product to start earning.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {investments.map((inv) => (
            <div key={inv.id} className="bg-white border border-gray-100 rounded-3xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col">
              <div className="flex gap-4 mb-4">
                <img src={inv.img} alt={inv.name} className="w-16 h-16 rounded-2xl object-cover" />
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 leading-tight">{inv.name}</h3>
                  <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mt-1 inline-block">Active</span>
                  <p className="text-sm font-black text-blue-600 mt-1">UGX {Number(inv.amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3 flex justify-between border border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{inv.statusText}</p>
                  <p className={`text-sm font-black ${inv.statusColor}`}>{inv.timeText}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Expected Return</p>
                  <p className="text-sm font-black text-gray-900">{Number(inv.expected_return).toLocaleString()} UGX</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
          }
