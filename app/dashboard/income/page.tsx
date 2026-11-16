"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// All 35 Products mapped
const productInfo: Record<string, any> = {
  "p1": { name: "LipaVault", category: "LOCK", cycleDays: 3, dailyRate: 0, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p2": { name: "LipaCore", category: "LOCK", cycleDays: 3, dailyRate: 0, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p3": { name: "LipaShield", category: "LOCK", cycleDays: 2, dailyRate: 0, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p4": { name: "LipaControl", category: "LOCK", cycleDays: 6, dailyRate: 0, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p5": { name: "LipaCredit", category: "LOCK", cycleDays: 5, dailyRate: 0, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p6": { name: "LipaDirect", category: "LOCK", cycleDays: 2, dailyRate: 0, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p7": { name: "LipaOmni", category: "LOCK", cycleDays: 2, dailyRate: 0, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p8": { name: "LipaAdmin", category: "LOCK", cycleDays: 5, dailyRate: 0, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p9": { name: "LipaLedger", category: "LOCK", cycleDays: 3, dailyRate: 0, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p10": { name: "LipaBridge", category: "LOCK", cycleDays: 4, dailyRate: 0, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p11": { name: "LipaConnect", category: "LOCK", cycleDays: 3, dailyRate: 0, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p12": { name: "LipaSDK", category: "LOCK", cycleDays: 2, dailyRate: 0, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p13": { name: "LipaGateway", category: "LOCK", cycleDays: 2, dailyRate: 0, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p14": { name: "LipaX", category: "LOCK", cycleDays: 2, dailyRate: 0, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p15": { name: "LipaDashboard", category: "LOCK", cycleDays: 2, dailyRate: 0, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p16": { name: "LipaFlow", category: "DAILY_PAYOUT", cycleDays: 5, dailyRate: 2000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p17": { name: "LipaPulse", category: "DAILY_PAYOUT", cycleDays: 3, dailyRate: 5000, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p18": { name: "LipaRewards", category: "DAILY_PAYOUT", cycleDays: 10, dailyRate: 5000, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p19": { name: "LipaSub", category: "DAILY_PAYOUT", cycleDays: 8, dailyRate: 15000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p20": { name: "LipaSpend", category: "DAILY_PAYOUT", cycleDays: 9, dailyRate: 25000, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p21": { name: "LipaSplit", category: "DAILY_PAYOUT", cycleDays: 8, dailyRate: 40000, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p22": { name: "LipaPaylink", category: "DAILY_PAYOUT", cycleDays: 9, dailyRate: 70000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p23": { name: "LipaInvoice", category: "DAILY_PAYOUT", cycleDays: 13, dailyRate: 150000, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p24": { name: "LipaInsights", category: "DAILY_PAYOUT", cycleDays: 10, dailyRate: 300000, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p25": { name: "LipaVirtual", category: "DAILY_PAYOUT", cycleDays: 8, dailyRate: 700000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p26": { name: "LipaTap", category: "UNLOCK_24H", cycleDays: 4, dailyRate: 2500, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p27": { name: "LipaScan", category: "UNLOCK_24H", cycleDays: 4, dailyRate: 4500, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p28": { name: "LipaGo", category: "UNLOCK_24H", cycleDays: 4, dailyRate: 10000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p29": { name: "LipaPocket", category: "UNLOCK_24H", cycleDays: 4, dailyRate: 20000, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p30": { name: "LipaWallet", category: "UNLOCK_24H", cycleDays: 4, dailyRate: 30000, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p31": { name: "LipaP2P", category: "UNLOCK_24H", cycleDays: 4, dailyRate: 40000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p32": { name: "LipaSoftPOS", category: "UNLOCK_24H", cycleDays: 4, dailyRate: 70000, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  "p33": { name: "LipaTerminal", category: "UNLOCK_24H", cycleDays: 4, dailyRate: 100000, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  "p34": { name: "LipaCheckout", category: "UNLOCK_24H", cycleDays: 4, dailyRate: 250000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  "p35": { name: "LipaRegister", category: "UNLOCK_24H", cycleDays: 4, dailyRate: 500000, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" }
};

// Live Timer Component
function LiveTimer({ targetTime, locked, label }: { targetTime: number, locked?: boolean, label: string }) {
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(targetTime - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime, timeLeft]);

  if (timeLeft <= 0) {
    return <span className={locked ? "text-red-400" : "text-green-400"}>{locked ? "Unlocking..." : "Processing..."}</span>;
  }

  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <span className={locked ? "text-red-400" : "text-green-400"}>
      {label} {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
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

      // Fetch user investments
      const { data: invs } = await supabase.from("investments").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      
      if (invs) {
        let updatedInvs = [...invs];
        let totalCreditToAdd = 0;

        // Process Auto-Credits (The "Lazy Cron")
        for (let i = 0; i < updatedInvs.length; i++) {
          const inv = updatedInvs[i];
          const info = productInfo[inv.product_id];
          if (!info) continue;

          const startTime = new Date(inv.created_at).getTime();
          const hoursElapsed = (Date.now() - startTime) / (1000 * 60 * 60);
          const daysElapsed = Math.floor(hoursElapsed / 24);

          // If it's a payout plan and time has passed
          if (info.category !== "LOCK" && daysElapsed > (inv.payouts_made || 0)) {
            const cyclesToPay = daysElapsed - (inv.payouts_made || 0);
            
            // Check if the plan has expired
            if (inv.payouts_made + cyclesToPay > info.cycleDays) {
               // Edge case: fully paid out. Cap at cycleDays.
               const remaining = info.cycleDays - (inv.payouts_made || 0);
               if(remaining > 0) totalCreditToAdd += (remaining * info.dailyRate);
               // Update DB to mark completed
               await supabase.from("investments").update({ payouts_made: info.cycleDays, status: "COMPLETED" }).eq("id", inv.id);
               updatedInvs[i].payouts_made = info.cycleDays;
               updatedInvs[i].status = "COMPLETED";
            } else {
               totalCreditToAdd += (cyclesToPay * info.dailyRate);
               // Update DB payouts_made
               await supabase.from("investments").update({ payouts_made: daysElapsed }).eq("id", inv.id);
               updatedInvs[i].payouts_made = daysElapsed;
            }
          }
        }

        // If we need to credit the user's balance
        if (totalCreditToAdd > 0) {
          const { data: bal } = await supabase.from("balances").select("available").eq("user_id", user.id).single();
          if (bal) {
            const newBalance = Number(bal.available) + totalCreditToAdd;
            await supabase.from("balances").update({ available: newBalance }).eq("user_id", user.id);
            
            // Log the payout transaction
            await supabase.from("transactions").insert({
              user_id: user.id,
              type: "COMMISSION", // using COMMISSION for payouts
              amount: totalCreditToAdd,
              status: "COMPLETED"
            });
            alert(`Auto-Credited UGX ${totalCreditToAdd.toLocaleString()} to your balance!`);
          }
        }

        setInvestments(updatedInvs);
      }
      setIsLoading(false);
    };

    fetchAndProcessInvestments();
    
    // Refresh every 30 seconds to check for new payouts
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

            const startTime = new Date(inv.created_at).getTime();
            const hoursElapsed = (Date.now() - startTime) / (1000 * 60 * 60);
            const daysElapsed = Math.floor(hoursElapsed / 24);
            
            // Calculate Next Payout Time
            const nextPayoutTime = startTime + ((inv.payouts_made + 1) * 24 * 60 * 60 * 1000);

            // Calculate Accrued Amount for Lock Plans
            const totalExpected = Number(inv.expected_return);
            const initialAmount = Number(inv.amount) || 0;
            const profit = totalExpected - initialAmount;
            const accruedProfit = info.category === "LOCK" 
              ? (hoursElapsed / (info.cycleDays * 24)) * profit 
              : (inv.payouts_made * info.dailyRate);

            // Check if fully completed
            const isCompleted = inv.status === "COMPLETED" || (info.category === "LOCK" && daysElapsed >= info.cycleDays);

            return (
              <div key={inv.id} className="bg-[#12141D] border border-gray-800 rounded-3xl p-4 shadow-lg relative overflow-hidden flex flex-col">
                <div className="flex gap-4 mb-4">
                  <img src={info.img} alt={info.name} className="w-16 h-16 rounded-2xl object-cover border border-gray-700" />
                  <div>
                    <h3 className="text-lg font-extrabold text-white leading-tight">{info.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mt-1 inline-block ${isCompleted ? 'bg-gray-700 text-gray-300' : 'bg-[#7B61FF]/20 text-[#7B61FF]'}`}>
                      {isCompleted ? "Completed" : "Active"}
                    </span>
                    <p className="text-sm font-black text-[#00D2FF] mt-1">UGX {Number(inv.amount).toLocaleString()}</p>
                  </div>
                </div>

                <div className="bg-[#0B0C10] rounded-2xl p-3 flex flex-col border border-gray-800 gap-2">
                  
                  {/* Top Row: Time Tracking */}
                  <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                     <p className="text-[10px] text-gray-500 font-bold uppercase">
                       {info.category === "LOCK" ? "Duration" : "Next Payout"}
                     </p>
                     
                     {isCompleted ? (
                       <p className="text-xs font-bold text-gray-400">Finished</p>
                     ) : info.category === "LOCK" ? (
                       <p className="text-xs font-bold text-[#00D2FF]">{daysElapsed} / {info.cycleDays} Days</p>
                     ) : (
                       <p className="text-xs font-bold"><LiveTimer targetTime={nextPayoutTime} locked={info.category === "UNLOCK_24H" && daysElapsed === 0} label="in" /></p>
                     )}
                  </div>

                  {/* Bottom Row: Financials */}
                  <div className="flex justify-between items-center pt-1">
                     <div>
                       <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
                         {info.category === "LOCK" ? "Accrued Return" : "Total Earned"}
                       </p>
                       <p className="text-sm font-black text-white">UGX {Math.floor(accruedProfit).toLocaleString()}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Total Return</p>
                       <p className="text-sm font-black text-green-400">{totalExpected.toLocaleString()} UGX</p>
                     </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
    }
