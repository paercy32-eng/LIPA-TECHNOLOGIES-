"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Reusing the Novida water images
const NOVIDA_IMAGES = [
  "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574966739987-65e38db0f7ce?q=80&w=400&auto=format&fit=crop",
];

function LiveTimer({ targetTime, isLocked }: { targetTime: number, isLocked?: boolean }) {
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());

  useEffect(() => {
    setTimeLeft(targetTime - Date.now());
    const interval = setInterval(() => setTimeLeft(targetTime - Date.now()), 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  if (timeLeft <= 0) return <span className="text-blue-600 font-bold">Processing...</span>;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <span className={isLocked ? "text-orange-500" : "text-blue-600"}>
      {days > 0 ? `${days}d ` : ''}
      {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}

export default function IncomePage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchAndProcessInvestments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch User's Investments with Product Details joined
      const { data: invs, error: invsError } = await supabase
        .from("investments")
        .select("*, products(name, duration_days, daily_payout, min_amount)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (invsError) {
        console.error("Investments load error:", invsError);
        setLoadError(invsError.message);
        setIsLoading(false);
        return;
      }

      setLoadError("");

      if (invs) {
        let updatedInvs = [...invs];
        let totalCreditToAdd = 0;

        for (let i = 0; i < updatedInvs.length; i++) {
          const inv = updatedInvs[i];
          if (!inv.products || inv.status === "COMPLETED") continue;

          const startTime = new Date(inv.created_at).getTime();
          const hoursElapsed = (Date.now() - startTime) / (1000 * 60 * 60);
          const daysElapsed = Math.floor(hoursElapsed / 24);
          const currentPayouts = Number(inv.payouts_made) || 0;

          // All products are DAILY_PAYOUT
          if (daysElapsed > currentPayouts) {
            const cyclesToPay = daysElapsed - currentPayouts;
            let amountToAdd = 0;

            if (currentPayouts + cyclesToPay > inv.products.duration_days) {
              const remaining = inv.products.duration_days - currentPayouts;
              if (remaining > 0) amountToAdd = (remaining * inv.products.daily_payout);

              const { error } = await supabase.from("investments").update({ payouts_made: inv.products.duration_days, status: "COMPLETED" }).eq("id", inv.id);
              if (!error) {
                totalCreditToAdd += amountToAdd;
                updatedInvs[i].payouts_made = inv.products.duration_days;
                updatedInvs[i].status = "COMPLETED";
              }
            } else {
              amountToAdd = (cyclesToPay * inv.products.daily_payout);

              const { error } = await supabase.from("investments").update({ payouts_made: daysElapsed }).eq("id", inv.id);
              if (!error) {
                totalCreditToAdd += amountToAdd;
                updatedInvs[i].payouts_made = daysElapsed;
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
    <div className="min-h-screen bg-[#f0f9ff] text-gray-900 p-5 pb-24">
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Income</h1>
        <p className="text-gray-500 text-sm mt-1">Track your active Novida VIPs</p>
      </div>

      {isLoading ? (
        <div className="text-center text-blue-500 mt-10 font-bold">Loading your portfolio...</div>
      ) : loadError ? (
        <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-3xl text-sm font-bold text-center">
          Could not load your investments: {loadError}
        </div>
      ) : investments.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-gray-800 font-bold">No active investments</p>
          <p className="text-gray-500 text-sm mt-1">Go to Home and buy a VIP plan to start earning.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {investments.map((inv, index) => {
            if (!inv.products) return null;
            const p = inv.products;

            const startTime = new Date(inv.created_at).getTime();
            const hoursElapsed = (Date.now() - startTime) / (1000 * 60 * 60);
            const displayDays = Math.floor(hoursElapsed / 24);
            const currentPayouts = Number(inv.payouts_made) || 0;

            // Next payout happens once the next full 24h cycle is reached
            const targetTime = startTime + ((currentPayouts + 1) * 24 * 60 * 60 * 1000);

            const totalExpected = Number(inv.expected_return);
            const initialAmount = Number(inv.amount) > 0 ? Number(inv.amount) : p.min_amount;
            const totalClaimed = currentPayouts * p.daily_payout;

            const progressPercent = Math.min((hoursElapsed / (p.duration_days * 24)) * 100, 100);
            const isCompleted = inv.status === "COMPLETED" || hoursElapsed >= (p.duration_days * 24);
            const imgUrl = NOVIDA_IMAGES[index % NOVIDA_IMAGES.length];

            return (
              <div key={inv.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <img
                      src={imgUrl}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                    />
                    <div>
                      <h3 className="text-[16px] font-black text-gray-900 leading-tight">{p.name}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider mt-1 inline-block ${isCompleted ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'}`}>
                        {isCompleted ? "COMPLETED" : "ACTIVE"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold">{new Date(inv.created_at).toLocaleDateString()}</p>
                </div>

                <div className="bg-[#f8fafc] rounded-2xl p-4 grid grid-cols-2 gap-y-4 gap-x-2 mb-4 border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Principal</p>
                    <p className="text-sm font-black text-gray-900">UGX {initialAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Daily Return</p>
                    <p className="text-sm font-black text-blue-600">+UGX {p.daily_payout.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Total Claimed</p>
                    <p className="text-sm font-black text-green-600">UGX {isCompleted ? totalExpected.toLocaleString() : totalClaimed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Cycle Progress</p>
                    <p className="text-sm font-black text-gray-900 flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      {Math.min(displayDays, p.duration_days)} / {p.duration_days} Days
                    </p>
                  </div>
                </div>

                <div className="mb-4 px-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] text-gray-500 font-bold">{Math.floor(progressPercent)}% completed</p>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>

                {!isCompleted && (
                  <div className="flex justify-between items-center bg-[#f8fafc] border border-blue-100 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <p className="text-[11px] text-gray-700 font-bold">Next Payout in:</p>
                    </div>
                    <p className="text-[14px] font-black">
                      <LiveTimer targetTime={targetTime} />
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