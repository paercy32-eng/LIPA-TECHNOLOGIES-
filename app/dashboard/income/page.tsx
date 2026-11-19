"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const productInfo: Record<string, any> = {
  "p1": { name: "LipaVault", category: "LOCK", cycleDays: 3, price: 10000, dailyRate: 0, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p2": { name: "LipaCore", category: "LOCK", cycleDays: 3, price: 5000, dailyRate: 0, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p3": { name: "LipaShield", category: "LOCK", cycleDays: 2, price: 50000, dailyRate: 0, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p4": { name: "LipaControl", category: "LOCK", cycleDays: 6, price: 100000, dailyRate: 0, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p5": { name: "LipaCredit", category: "LOCK", cycleDays: 5, price: 150000, dailyRate: 0, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p6": { name: "LipaDirect", category: "LOCK", cycleDays: 2, price: 200000, dailyRate: 0, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p7": { name: "LipaOmni", category: "LOCK", cycleDays: 2, price: 75000, dailyRate: 0, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p8": { name: "LipaAdmin", category: "LOCK", cycleDays: 5, price: 20000, dailyRate: 0, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p9": { name: "LipaLedger", category: "LOCK", cycleDays: 3, price: 50000, dailyRate: 0, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p10": { name: "LipaBridge", category: "LOCK", cycleDays: 4, price: 180000, dailyRate: 0, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p11": { name: "LipaConnect", category: "LOCK", cycleDays: 3, price: 250000, dailyRate: 0, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p12": { name: "LipaSDK", category: "LOCK", cycleDays: 2, price: 500000, dailyRate: 0, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p13": { name: "LipaGateway", category: "LOCK", cycleDays: 2, price: 800000, dailyRate: 0, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p14": { name: "LipaX", category: "LOCK", cycleDays: 2, price: 1000000, dailyRate: 0, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p15": { name: "LipaDashboard", category: "LOCK", cycleDays: 2, price: 2000000, dailyRate: 0, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p16": { name: "LipaFlow", category: "DAILY_PAYOUT", cycleDays: 5, price: 5000, dailyRate: 2000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p17": { name: "LipaPulse", category: "DAILY_PAYOUT", cycleDays: 3, price: 10000, dailyRate: 5000, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p18": { name: "LipaRewards", category: "DAILY_PAYOUT", cycleDays: 10, price: 25000, dailyRate: 5000, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p19": { name: "LipaSub", category: "DAILY_PAYOUT", cycleDays: 8, price: 50000, dailyRate: 15000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p20": { name: "LipaSpend", category: "DAILY_PAYOUT", cycleDays: 9, price: 100000, dailyRate: 25000, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p21": { name: "LipaSplit", category: "DAILY_PAYOUT", cycleDays: 8, price: 150000, dailyRate: 40000, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p22": { name: "LipaPaylink", category: "DAILY_PAYOUT", cycleDays: 9, price: 250000, dailyRate: 70000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p23": { name: "LipaInvoice", category: "DAILY_PAYOUT", cycleDays: 13, price: 500000, dailyRate: 150000, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p24": { name: "LipaInsights", category: "DAILY_PAYOUT", cycleDays: 10, price: 1000000, dailyRate: 300000, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p25": { name: "LipaVirtual", category: "DAILY_PAYOUT", cycleDays: 8, price: 2000000, dailyRate: 700000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p26": { name: "LipaTap", category: "UNLOCK_24H", cycleDays: 4, price: 5000, dailyRate: 2500, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p27": { name: "LipaScan", category: "UNLOCK_24H", cycleDays: 4, price: 10000, dailyRate: 4500, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p28": { name: "LipaGo", category: "UNLOCK_24H", cycleDays: 4, price: 25000, dailyRate: 10000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p29": { name: "LipaPocket", category: "UNLOCK_24H", cycleDays: 4, price: 50000, dailyRate: 20000, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p30": { name: "LipaWallet", category: "UNLOCK_24H", cycleDays: 4, price: 75000, dailyRate: 30000, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p31": { name: "LipaP2P", category: "UNLOCK_24H", cycleDays: 4, price: 100000, dailyRate: 40000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p32": { name: "LipaSoftPOS", category: "UNLOCK_24H", cycleDays: 4, price: 150000, dailyRate: 70000, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p33": { name: "LipaTerminal", category: "UNLOCK_24H", cycleDays: 4, price: 250000, dailyRate: 100000, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p34": { name: "LipaCheckout", category: "UNLOCK_24H", cycleDays: 4, price: 500000, dailyRate: 250000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p35": { name: "LipaRegister", category: "UNLOCK_24H", cycleDays: 4, price: 1000000, dailyRate: 500000, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" }
};

// Helper to get calendar days for Locked Plans (resets at Midnight EAT)
const getCalendarDaysElapsed = (createdAtStr: string) => {
  const start = new Date(createdAtStr);
  const now = new Date();
  const startEAT = start.toLocaleDateString("en-GB", { timeZone: "Africa/Kampala" });
  const nowEAT = now.toLocaleDateString("en-GB", { timeZone: "Africa/Kampala" });
  if (startEAT === nowEAT) return 0;
  const [sDay, sMonth, sYear] = startEAT.split('/').map(Number);
  const [nDay, nMonth, nYear] = nowEAT.split('/').map(Number);
  const startUTC = Date.UTC(sYear, sMonth - 1, sDay);
  const nowUTC = Date.UTC(nYear, nMonth - 1, nDay);
  return Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24));
};

// Live Timer Component that calculates exact hours/minutes/seconds
function LiveTimer({ targetTime, isLocked }: { targetTime: number, isLocked?: boolean }) {
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(targetTime - Date.now()), 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  if (timeLeft <= 0) return <span className="text-green-400">Processing...</span>;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <span className={isLocked ? "text-[#00D2FF]" : "text-green-400"}>
      {days > 0 ? `${days}d ` : ''}
      {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}

export default function IncomePage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessInvestments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: invs } = await supabase.from("investments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      
      if (invs) {
        let updatedInvs = [...invs];
        let totalCreditToAdd = 0;

        for (let i = 0; i < updatedInvs.length; i++) {
          const inv = updatedInvs[i];
          const info = productInfo[inv.product_id];
          if (!info || inv.status === "COMPLETED") continue;

          const startTime = new Date(inv.created_at).getTime();
          const hoursElapsed = (Date.now() - startTime) / (1000 * 60 * 60);
          const daysElapsed = Math.floor(hoursElapsed / 24);
          const currentPayouts = Number(inv.payouts_made) || 0;

          if (info.category !== "LOCK") {
            // For DAILY_PAYOUT and UNLOCK_24H
            if (daysElapsed > currentPayouts) {
              const cyclesToPay = daysElapsed - currentPayouts;
              let amountToAdd = 0;
              
              if (currentPayouts + cyclesToPay > info.cycleDays) {
                 const remaining = info.cycleDays - currentPayouts;
                 if(remaining > 0) amountToAdd = (remaining * info.dailyRate);
                 
                 const { error } = await supabase.from("investments").update({ payouts_made: info.cycleDays, status: "COMPLETED" }).eq("id", inv.id);
                 if (!error) {
                   totalCreditToAdd += amountToAdd;
                   updatedInvs[i].payouts_made = info.cycleDays;
                   updatedInvs[i].status = "COMPLETED";
                 }
              } else {
                 amountToAdd = (cyclesToPay * info.dailyRate);
                 
                 const { error } = await supabase.from("investments").update({ payouts_made: daysElapsed }).eq("id", inv.id);
                 if (!error) {
                   totalCreditToAdd += amountToAdd;
                   updatedInvs[i].payouts_made = daysElapsed;
                 }
              }
            }
          } else {
            // For LOCK plans: credit ONLY after the exact total hours pass (e.g., 3 days = 72 hours)
            const totalHoursNeeded = info.cycleDays * 24;
            if (hoursElapsed >= totalHoursNeeded) {
              const { error } = await supabase.from("investments").update({ status: "COMPLETED" }).eq("id", inv.id);
              if (!error) {
                updatedInvs[i].status = "COMPLETED";
                totalCreditToAdd += Number(inv.expected_return);
              }
            }
          }
        }

        if (totalCreditToAdd > 0) {
          const { data: bal } = await supabase.from("balances").select("available").eq("user_id", user.id).single();
          if (bal) {
            const newBalance = Number(bal.available) + totalCreditToAdd;
            await supabase.from("balances").update({ available: newBalance }).eq("user_id", user.id);
            await supabase.from("transactions").insert({
              user_id: user.id, type: "DAILY_EARNING", amount: totalCreditToAdd, status: "COMPLETED"
            });
            alert(`UGX ${totalCreditToAdd.toLocaleString()} has been credited to your balance!`);
          }
        }
        setInvestments(updatedInvs);
      }
      setIsLoading(false);
    };

    fetchAndProcessInvestments();
    const interval = setInterval(fetchAndProcessInvestments, 30000); 
    return () => clearInterval(interval);
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
          {investments.map((inv) => {
            const info = productInfo[inv.product_id];
            if (!info) return null;

            const isLockedPlan = info.category === "LOCK";
            const startTime = new Date(inv.created_at).getTime();
            const hoursElapsed = (Date.now() - startTime) / (1000 * 60 * 60);
            
            // Display Progress vs Math Progress
            const displayDays = isLockedPlan ? getCalendarDaysElapsed(inv.created_at) : Math.floor(hoursElapsed / 24);
            const currentPayouts = Number(inv.payouts_made) || 0;
            
            // Timer Targets
            let targetTime = 0;
            let timerLabel = "";

            if (isLockedPlan) {
              // 3 days lock = 72 hours exactly
              const totalHoursNeeded = info.cycleDays * 24;
              targetTime = startTime + (totalHoursNeeded * 60 * 60 * 1000); 
              timerLabel = "Maturity in:";
            } else if (info.category === "DAILY_PAYOUT") {
              // Next payout is 24 hours after the last one. 
              // Since day 1 is instant, payouts_made starts at 1. So target is startTime + 24h.
              targetTime = startTime + (currentPayouts * 24 * 60 * 60 * 1000); 
              timerLabel = "Next Payout:";
            } else if (info.category === "UNLOCK_24H") {
               if (currentPayouts === 0) {
                 targetTime = startTime + (24 * 60 * 60 * 1000); // 24h to unlock
                 timerLabel = "Unlocks in:";
               } else {
                 targetTime = startTime + (currentPayouts * 24 * 60 * 60 * 1000); // 24h cycles after unlock
                 timerLabel = "Next Payout:";
               }
            }

            const totalExpected = Number(inv.expected_return);
            const initialAmount = Number(inv.amount) > 0 ? Number(inv.amount) : info.price;
            const totalClaimed = isLockedPlan ? 0 : (currentPayouts * info.dailyRate);
            
            const progressPercent = Math.min((hoursElapsed / (info.cycleDays * 24)) * 100, 100);
            const isCompleted = inv.status === "COMPLETED" || hoursElapsed >= (info.cycleDays * 24);
            const accruedProfit = isLockedPlan ? (hoursElapsed / (info.cycleDays * 24)) * (totalExpected - initialAmount) : (currentPayouts * info.dailyRate);

            return (
              <div key={inv.id} className="bg-[#12141D] border border-gray-800 rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <img src={info.img} alt={info.name} className="w-12 h-12 rounded-xl object-cover border border-gray-700" />
                    <div>
                      <h3 className="text-[15px] font-extrabold text-white leading-tight">{info.name}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mt-1 inline-block ${isCompleted ? 'bg-gray-700 text-gray-300' : 'bg-[#00D2FF]/20 text-[#00D2FF]'}`}>
                        {isCompleted ? "COMPLETED" : "ACTIVE"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">{new Date(inv.created_at).toLocaleDateString()}</p>
                </div>

                <div className="bg-[#0B0C10] rounded-2xl p-4 grid grid-cols-2 gap-y-4 gap-x-2 mb-4 border border-gray-800">
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium mb-0.5">Principal</p>
                    <p className="text-sm font-bold text-white">UGX {initialAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium mb-0.5">Daily Return</p>
                    <p className="text-sm font-bold text-[#00D2FF]">
                      {isLockedPlan ? `UGX ${totalExpected.toLocaleString()} end` : `+UGX ${info.dailyRate.toLocaleString()}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium mb-0.5">Total Claimed</p>
                    <p className="text-sm font-bold text-green-400">UGX {isCompleted ? totalExpected.toLocaleString() : totalClaimed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium mb-0.5">Cycle Progress</p>
                    <p className="text-sm font-bold text-white flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {Math.min(displayDays, info.cycleDays)} / {info.cycleDays} Days
                    </p>
                  </div>
                </div>

                <div className="mb-4 px-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] text-gray-400 font-medium">{Math.floor(progressPercent)}% completed</p>
                    <p className="text-[10px] text-gray-400 font-medium">{isLockedPlan ? `Accrued: UGX ${Math.floor(accruedProfit).toLocaleString()}` : ""}</p>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7B61FF] rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>

                {!isCompleted && (
                  <div className="flex justify-between items-center bg-[#0B0C10] border border-[#00D2FF]/30 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#00D2FF]/10 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00D2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <p className="text-[11px] text-white font-medium">{timerLabel}</p>
                    </div>
                    <p className="text-[13px] font-bold">
                      <LiveTimer targetTime={targetTime} isLocked={isLockedPlan} />
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  }
