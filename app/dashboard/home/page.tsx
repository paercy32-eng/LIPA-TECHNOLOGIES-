"use client";

import { useState } from "react";

export default function HomePage() {
  // State to track which tab is active
  const [activeTab, setActiveTab] = useState("ALL");

  // Navigation Tabs
  const tabs = [
    { id: "ALL", label: "All" },
    { id: "LOCK", label: "Lock Plans" },
    { id: "DAILY_PAYOUT", label: "Daily Payouts" },
    { id: "UNLOCK_24H", label: "24Hr Unlock" },
  ];

  // FULL LIST OF 35 PRODUCTS
  const products = [
    // --- LOCK PLANS (15 Products) ---
    { id: 1, name: "LipaVault", category: "LOCK", price: 10000, daily: "0", cycle: "3d", total: 25000 },
    { id: 2, name: "LipaCore", category: "LOCK", price: 5000, daily: "0", cycle: "3d", total: 13000 },
    { id: 3, name: "LipaShield", category: "LOCK", price: 50000, daily: "0", cycle: "2d", total: 75000 },
    { id: 4, name: "LipaControl", category: "LOCK", price: 100000, daily: "0", cycle: "6d", total: 300000 },
    { id: 5, name: "LipaCredit", category: "LOCK", price: 150000, daily: "0", cycle: "5d", total: 450000 },
    { id: 6, name: "LipaDirect", category: "LOCK", price: 200000, daily: "0", cycle: "2d", total: 300000 },
    { id: 7, name: "LipaOmni", category: "LOCK", price: 75000, daily: "0", cycle: "2d", total: 110000 },
    { id: 8, name: "LipaAdmin", category: "LOCK", price: 20000, daily: "0", cycle: "5d", total: 50000 },
    { id: 9, name: "LipaLedger", category: "LOCK", price: 50000, daily: "0", cycle: "3d", total: 80000 },
    { id: 10, name: "LipaBridge", category: "LOCK", price: 180000, daily: "0", cycle: "4d", total: 400000 },
    { id: 11, name: "LipaConnect", category: "LOCK", price: 250000, daily: "0", cycle: "3d", total: 500000 },
    { id: 12, name: "LipaSDK", category: "LOCK", price: 500000, daily: "0", cycle: "2d", total: 100000 },
    { id: 13, name: "LipaGateway", category: "LOCK", price: 800000, daily: "0", cycle: "2d", total: 2000000 },
    { id: 14, name: "LipaX", category: "LOCK", price: 1000000, daily: "0", cycle: "2d", total: 3000000 },
    { id: 15, name: "LipaDashboard", category: "LOCK", price: 2000000, daily: "0", cycle: "2d", total: 4500000 },

    // --- DAILY PAYOUTS (10 Products) ---
    { id: 16, name: "LipaFlow", category: "DAILY_PAYOUT", price: 5000, daily: "2,000", cycle: "5d", total: 10000 },
    { id: 17, name: "LipaPulse", category: "DAILY_PAYOUT", price: 10000, daily: "5,000", cycle: "3d", total: 15000 },
    { id: 18, name: "LipaRewards", category: "DAILY_PAYOUT", price: 25000, daily: "5,000", cycle: "10d", total: 50000 },
    { id: 19, name: "LipaSub", category: "DAILY_PAYOUT", price: 50000, daily: "15,000", cycle: "8d", total: 120000 },
    { id: 20, name: "LipaSpend", category: "DAILY_PAYOUT", price: 100000, daily: "25,000", cycle: "9d", total: 225000 },
    { id: 21, name: "LipaSplit", category: "DAILY_PAYOUT", price: 150000, daily: "40,000", cycle: "8d", total: 320000 },
    { id: 22, name: "LipaPaylink", category: "DAILY_PAYOUT", price: 250000, daily: "70,000", cycle: "9d", total: 630000 },
    { id: 23, name: "LipaInvoice", category: "DAILY_PAYOUT", price: 500000, daily: "150,000", cycle: "13d", total: 1950000 },
    { id: 24, name: "LipaInsights", category: "DAILY_PAYOUT", price: 1000000, daily: "300,000", cycle: "10d", total: 3000000 },
    { id: 25, name: "LipaVirtual", category: "DAILY_PAYOUT", price: 2000000, daily: "700,000", cycle: "8d", total: 5600000 },

    // --- 24HR UNLOCK (10 Products) ---
    { id: 26, name: "LipaTap", category: "UNLOCK_24H", price: 5000, daily: "2,500", cycle: "4d", total: 10000 },
    { id: 27, name: "LipaScan", category: "UNLOCK_24H", price: 10000, daily: "4,500", cycle: "4d", total: 18000 },
    { id: 28, name: "LipaGo", category: "UNLOCK_24H", price: 25000, daily: "10,000", cycle: "4d", total: 40000 },
    { id: 29, name: "LipaPocket", category: "UNLOCK_24H", price: 50000, daily: "20,000", cycle: "4d", total: 80000 },
    { id: 30, name: "LipaWallet", category: "UNLOCK_24H", price: 75000, daily: "30,000", cycle: "4d", total: 120000 },
    { id: 31, name: "LipaP2P", category: "UNLOCK_24H", price: 100000, daily: "40,000", cycle: "4d", total: 160000 },
    { id: 32, name: "LipaSoftPOS", category: "UNLOCK_24H", price: 150000, daily: "70,000", cycle: "4d", total: 280000 },
    { id: 33, name: "LipaTerminal", category: "UNLOCK_24H", price: 250000, daily: "100,000", cycle: "4d", total: 400000 },
    { id: 34, name: "LipaCheckout", category: "UNLOCK_24H", price: 500000, daily: "250,000", cycle: "4d", total: 1000000 },
    { id: 35, name: "LipaRegister", category: "UNLOCK_24H", price: 1000000, daily: "500,000", cycle: "4d", total: 2000000 },
  ];

  // Filter logic based on selected tab
  const filteredProducts = activeTab === "ALL" 
    ? products 
    : products.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="p-5 pt-8">
        <h1 className="text-3xl font-extrabold text-[#00d2ff] tracking-tight">LIPA Technologies</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 px-5 border-b border-gray-800 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 whitespace-nowrap font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab.id ? "text-[#00d2ff] border-[#00d2ff]" : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="bg-[#051105] border border-green-500/60 rounded-2xl p-3 flex flex-col justify-between shadow-[0_0_15px_rgba(34,197,94,0.1)] relative"
          >
            
            <div>
              {/* Product Image/Placeholder (SVG) */}
              <div className="w-full h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl mb-3 flex items-center justify-center border border-gray-700/50">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00d2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                   <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                 </svg>
              </div>

              {/* Product Info */}
              <h3 className="text-[#00d2ff] font-bold text-lg leading-tight truncate">{product.name}</h3>
              <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-2 mt-0.5">{product.category.replace('_', ' ')}</p>

              {/* Price */}
              <p className="text-gray-500 text-[10px] font-bold tracking-wider mb-0.5">PRICE</p>
              <p className="text-white text-xl font-bold">
                {product.price.toLocaleString()} <span className="text-xs font-medium text-gray-400">UGX</span>
              </p>
            </div>

            {/* Stats Box */}
            <div className="bg-black/60 rounded-xl p-2 mt-3 mb-3 flex justify-between text-center border border-gray-800">
              <div className="flex-1 border-r border-gray-800">
                <p className="text-gray-500 text-[9px] font-bold">DAILY</p>
                <p className="text-[#00d2ff] text-[11px] font-bold">{product.daily}</p>
              </div>
              <div className="flex-1 border-r border-gray-800">
                <p className="text-gray-500 text-[9px] font-bold">CYCLE</p>
                <p className="text-[#00d2ff] text-[11px] font-bold">{product.cycle}</p>
              </div>
              <div className="flex-1">
                <p className="text-gray-500 text-[9px] font-bold">TOTAL</p>
                <p className="text-[#00d2ff] text-[11px] font-bold">{product.total.toLocaleString()}</p>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full bg-[#00d2ff] hover:bg-cyan-400 text-black font-extrabold py-2.5 rounded-xl text-sm transition-all shadow-[0_0_10px_rgba(0,210,255,0.3)]">
              Lock in
            </button>
          </div>
        ))}
      </div>
      
      {/* Message if no products found (fallback) */}
      {filteredProducts.length === 0 && (
        <div className="text-center text-gray-500 mt-10">No products available in this category.</div>
      )}
    </div>
  );
     }
