"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// All 35 Products mapped
const productInfo: Record<string, any> = {
  "p1": { name: "LipaVault", category: "LOCK", cycleDays: 3, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p2": { name: "LipaCore", category: "LOCK", cycleDays: 3, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p3": { name: "LipaShield", category: "LOCK", cycleDays: 2, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p4": { name: "LipaControl", category: "LOCK", cycleDays: 6, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p5": { name: "LipaCredit", category: "LOCK", cycleDays: 5, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p6": { name: "LipaDirect", category: "LOCK", cycleDays: 2, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p7": { name: "LipaOmni", category: "LOCK", cycleDays: 2, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p8": { name: "LipaAdmin", category: "LOCK", cycleDays: 5, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p9": { name: "LipaLedger", category: "LOCK", cycleDays: 3, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p10": { name: "LipaBridge", category: "LOCK", cycleDays: 4, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p11": { name: "LipaConnect", category: "LOCK", cycleDays: 3, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p12": { name: "LipaSDK", category: "LOCK", cycleDays: 2, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p13": { name: "LipaGateway", category: "LOCK", cycleDays: 2, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p14": { name: "LipaX", category: "LOCK", cycleDays: 2, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p15": { name: "LipaDashboard", category: "LOCK", cycleDays: 2, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p16": { name: "LipaFlow", category: "DAILY_PAYOUT", cycleDays: 5, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p17": { name: "LipaPulse", category: "DAILY_PAYOUT", cycleDays: 3, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p18": { name: "LipaRewards", category: "DAILY_PAYOUT", cycleDays: 10, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p19": { name: "LipaSub", category: "DAILY_PAYOUT", cycleDays: 8, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p20": { name: "LipaSpend", category: "DAILY_PAYOUT", cycleDays: 9, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p21": { name: "LipaSplit", category: "DAILY_PAYOUT", cycleDays: 8, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p22": { name: "LipaPaylink", category: "DAILY_PAYOUT", cycleDays: 9, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p23": { name: "LipaInvoice", category: "DAILY_PAYOUT", cycleDays: 13, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p24": { name: "LipaInsights", category: "DAILY_PAYOUT", cycleDays: 10, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p25": { name: "LipaVirtual", category: "DAILY_PAYOUT", cycleDays: 8, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p26": { name: "LipaTap", category: "UNLOCK_24H", cycleDays: 4, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p27": { name: "LipaScan", category: "UNLOCK_24H", cycleDays: 4, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p28": { name: "LipaGo", category: "UNLOCK_24H", cycleDays: 4, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p29": { name: "LipaPocket", category: "UNLOCK_24H", cycleDays: 4, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p30": { name: "LipaWallet", category: "UNLOCK_24H", cycleDays: 4, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p31": { name: "LipaP2P", category: "UNLOCK_24H", cycleDays: 4, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p32": { name: "LipaSoftPOS", category: "UNLOCK_24H", cycleDays: 4, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p33": { name: "LipaTerminal", category: "UNLOCK_24H", cycleDays: 4, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p34": { name: "LipaCheckout", category: "UNLOCK_24H", cycleDays: 4, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p35": { name: "LipaRegister", category: "UNLOCK_24H", cycleDays: 4, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" }
};

export default function IncomePage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.from("investments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

      if (data) {
        const processedData = data.map(inv => {
          const info = productInfo[inv.product_id] || { name: "Unknown", category: "LOCK", cycleDays: 3, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400" };
          
          const hoursElapsed = (new Date().getTime() - new Date(inv.created_at).getTime()) / (1000 * 60 * 60);

          let statusText = "";
          let statusColor = "text-gray-400";
          let timeText = "";

          if (info.category === "LOCK") {
            const days = Math.floor(hoursElapsed / 24);
            statusText = "Days Active";
            timeText = `${days} / ${info.cycleDays} Days`;
            statusColor = "text-[#00D2FF]";
          } else if (info.category === "DAILY_PAYOUT") {
            const nextPayout = 24 - (hoursElapsed % 24);
            statusText = "Next Payout";
            timeText = `in ${Math.floor(nextPayout)} hrs`;
            statusColor = "text-green-400";
          } else if (info.category === "UNLOCK_24H") {
            if (hoursElapsed < 24) {
              statusText = "Locked";
              timeText = `Unlocks in ${Math.floor(24 - hoursElapsed)} hrs`;
              statusColor = "text-red-400";
            } else {
              const nextPayout = 24 - (hoursElapsed % 24);
              statusText = "Next Payout";
              timeText = `in ${Math.floor(nextPayout)} hrs`;
              statusColor = "text-green-400";
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
    <div className="min-h-screen bg-[#0B0C10] text-white p-5 pb-24">
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-black text-white tracking-tight">My Income</h1>
        <p className="text-gray-400 text-sm mt-1">Track your active investments</p>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 mt-10">Loading your portfolio...</div>
      ) : investments.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center bg-[#12141D] p-8 rounded-3xl border border-gray-800">
          <div className="w-20 h-20 bg-[#7B61FF]/10 rounded-full flex items-center justify-center mb-4 text-[#7B61FF]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-white font-bold">No active investments</p>
          <p className="text-gray-500 text-sm mt-1">Go to Home and buy a product to start earning.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {investments.map((inv) => (
            <div key={inv.id} className="bg-[#12141D] border border-gray-800 rounded-3xl p-4 shadow-lg relative overflow-hidden flex flex-col">
              <div className="flex gap-4 mb-4">
                <img src={inv.img} alt={inv.name} className="w-16 h-16 rounded-2xl object-cover border border-gray-700" />
                <div>
                  <h3 className="text-lg font-extrabold text-white leading-tight">{inv.name}</h3>
                  <span className="text-[10px] bg-[#7B61FF]/20 text-[#7B61FF] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mt-1 inline-block">Active</span>
                  <p className="text-sm font-black text-[#00D2FF] mt-1">UGX {Number(inv.amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-[#0B0C10] rounded-2xl p-3 flex justify-between border border-gray-800">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{inv.statusText}</p>
                  <p className={`text-sm font-black ${inv.statusColor}`}>{inv.timeText}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Expected Return</p>
                  <p className="text-sm font-black text-white">{Number(inv.expected_return).toLocaleString()} UGX</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
                                                                         }
