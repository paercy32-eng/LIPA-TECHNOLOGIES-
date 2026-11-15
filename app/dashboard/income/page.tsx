"use client";

import { useState, useEffect } from "react";

export default function IncomePage() {
  const [activeProducts, setActiveProducts] = useState<any[]>([]);

  // Simulate fetching active products from local storage
  useEffect(() => {
    const saved = localStorage.getItem("purchasedProducts");
    if (saved) {
      const purchasedIds = JSON.parse(saved);
      // Mock data (In a real app, you'd fetch this from Supabase investments table)
      const allProducts = [
        { id: 16, name: "LipaFlow", type: "DAILY_PAYOUT", dailyReturn: "2,000", nextPayout: "24 Hours", daysEarned: 0, totalDays: 5 },
        { id: 26, name: "LipaTap", type: "UNLOCK_24H", dailyReturn: "2,500", nextPayout: "Unlocks in 24hrs", daysEarned: 0, totalDays: 4 },
        { id: 1, name: "LipaVault", type: "LOCK", dailyReturn: "0", nextPayout: "3 Days", daysEarned: 0, totalDays: 3 },
      ];
      
      const active = allProducts.filter(p => purchasedIds.includes(p.id));
      setActiveProducts(active);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-5 pb-24">
      
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">My Income</h1>
        <p className="text-gray-400 text-sm mt-1">Track your active investments</p>
      </div>

      {activeProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-gray-400">No active investments yet.</p>
          <p className="text-gray-600 text-sm mt-1">Go to Home and buy a product to start earning.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeProducts.map((product) => (
            <div key={product.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              
              {/* Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 blur-2xl rounded-full"></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{product.name}</h3>
                  <p className="text-[10px] text-green-400 font-bold tracking-widest uppercase mt-1">Active</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">Daily Return</p>
                  <p className="text-lg font-bold text-[#00d2ff]">{product.dailyReturn} UGX</p>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-3 flex justify-between border border-gray-800">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Days Earned</p>
                  <p className="text-sm font-bold text-white">{product.daysEarned} / {product.totalDays}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Next Payout</p>
                  <p className="text-sm font-bold text-green-400">{product.nextPayout}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
