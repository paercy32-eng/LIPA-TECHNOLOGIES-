"use client";

import { useState } from "react";

// Using SVG icons instead of emojis
const TabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("ALL");

  const tabs = [
    { id: "ALL", label: "All" },
    { id: "LOCK", label: "Lock Plans" },
    { id: "DAILY_PAYOUT", label: "Daily Payouts" },
    { id: "UNLOCK_24H", label: "24Hr Unlock" },
  ];

  // Sample data from your 35 products (You can connect this to Supabase later)
  const products = [
    { id: 1, name: "LipaVault", category: "LOCK", price: 10000, daily: "0", cycle: "3d", total: 25000 },
    { id: 2, name: "LipaCore", category: "LOCK", price: 5000, daily: "0", cycle: "3d", total: 13000 },
    { id: 3, name: "LipaFlow", category: "DAILY_PAYOUT", price: 5000, daily: 2000, cycle: "5d", total: 10000 },
    { id: 4, name: "LipaPulse", category: "DAILY_PAYOUT", price: 10000, daily: 5000, cycle: "3d", total: 15000 },
    { id: 5, name: "LipaTap", category: "UNLOCK_24H", price: 5000, daily: 2500, cycle: "4d", total: 10000 },
    { id: 6, name: "LipaGo", category: "UNLOCK_24H", price: 10000, daily: 4500, cycle: "4d", total: 18000 },
  ];

  // Filter logic: Shows all if 'ALL' is selected, otherwise filters by category
  const filteredProducts = activeTab === "ALL" 
    ? products 
    : products.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <div className="p-4 pt-6">
        <h1 className="text-3xl font-extrabold text-[#00d2ff] tracking-tight">LIPA Technologies</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 px-4 border-b border-gray-800 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 whitespace-nowrap font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab.id ? "text-[#00d2ff] border-[#00d2ff]" : "text-gray-500 border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-[#051105] border border-green-500/60 rounded-2xl p-3 flex flex-col justify-between shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            
            <div>
              {/* Product Image/Placeholder */}
              <div className="w-full h-24 bg-gray-800 rounded-xl mb-3 flex items-center justify-center">
                 <TabIcon />
              </div>

              {/* Product Info */}
              <h3 className="text-[#00d2ff] font-bold text-lg leading-tight">{product.name}</h3>
              <p className="text-gray-400 text-xs mb-3">{product.category.replace('_', ' ')}</p>

              {/* Price */}
              <p className="text-gray-500 text-[10px] font-bold tracking-wider mb-1">PRICE</p>
              <p className="text-white text-2xl font-bold">
                {product.price.toLocaleString()} <span className="text-sm">UGX</span>
              </p>
            </div>

            {/* Stats Box */}
            <div className="bg-black/60 rounded-xl p-2 mt-4 mb-3 flex justify-between text-center">
              <div>
                <p className="text-gray-400 text-[10px]">DAILY</p>
                <p className="text-[#00d2ff] text-xs font-bold">{product.daily.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px]">CYCLE</p>
                <p className="text-[#00d2ff] text-xs font-bold">{product.cycle}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px]">TOTAL</p>
                <p className="text-[#00d2ff] text-xs font-bold">{product.total.toLocaleString()}</p>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full bg-[#00d2ff] hover:bg-cyan-400 text-black font-bold py-2 rounded-lg text-sm transition">
              Lock in
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
