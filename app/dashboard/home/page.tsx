"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [purchased, setPurchased] = useState<number[]>([]);

  // Load purchased items from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("purchasedProducts");
    if (saved) setPurchased(JSON.parse(saved));
  }, []);

  const handlePurchase = (id: number) => {
    if (purchased.includes(id)) return; // Already purchased
    const newPurchased = [...purchased, id];
    setPurchased(newPurchased);
    localStorage.setItem("purchasedProducts", JSON.stringify(newPurchased));
    alert("Product activated successfully! Check your Income tab.");
  };

  const tabs = [
    { id: "ALL", label: "All" },
    { id: "LOCK", label: "Lock Plans" },
    { id: "DAILY_PAYOUT", label: "Daily Payouts" },
    { id: "UNLOCK_24H", label: "24Hr Unlock" },
  ];

  // Images for categories
  const images = {
    LOCK: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop", // Vault/Tech
    DAILY_PAYOUT: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop", // Charts
    UNLOCK_24H: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop", // Speed/Wallet
  };

  const products = [
    // --- LOCK PLANS ---
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

    // --- DAILY PAYOUTS ---
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

    // --- 24HR UNLOCK ---
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

  const filteredProducts = activeTab === "ALL" ? products : products.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="p-5 pt-8">
        <h1 className="text-3xl font-extrabold text-[#00d2ff] tracking-tight">LIPA Technologies</h1>
      </div>

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

      <div className="p-4 grid grid-cols-2 gap-4">
        {filteredProducts.map((product) => {
          const isPurchased = purchased.includes(product.id);
          const imgUrl = images[product.category as keyof typeof images];

          // Button Logic
          let btnText = "";
          let btnClass = "bg-[#00d2ff] hover:bg-cyan-400 text-black shadow-[0_0_10px_rgba(0,210,255,0.3)]";
          if (isPurchased) {
            btnClass = "bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700";
            if (product.category === "LOCK") btnText = "Locked In";
            else if (product.category === "DAILY_PAYOUT") btnText = "Purchased";
            else if (product.category === "UNLOCK_24H") {
              btnText = "Unlocked";
              btnClass = "bg-green-900/40 text-green-400 border border-green-800 cursor-not-allowed";
            }
          } else {
            if (product.category === "LOCK") btnText = "Lock In";
            else if (product.category === "DAILY_PAYOUT") btnText = "Buy Now";
            else if (product.category === "UNLOCK_24H") btnText = "Locked";
          }

          return (
            <div key={product.id} className="bg-[#051105] border border-green-500/40 rounded-2xl flex flex-col justify-between overflow-hidden shadow-lg">
              
              {/* Image Section */}
              <div className="w-full h-28 relative">
                <img src={imgUrl} alt={product.name} className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#051105] to-transparent"></div>
              </div>

              <div className="p-3 pt-0">
                <h3 className="text-[#00d2ff] font-bold text-lg leading-tight truncate">{product.name}</h3>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-2 mt-0.5">{product.category.replace('_', ' ')}</p>

                <p className="text-gray-500 text-[10px] font-bold tracking-wider mb-0.5">PRICE</p>
                <p className="text-white text-xl font-bold mb-3">
                  {product.price.toLocaleString()} <span className="text-xs font-medium text-gray-400">UGX</span>
                </p>

                <div className="bg-black/60 rounded-xl p-2 mb-3 flex justify-between text-center border border-gray-800">
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

                <button 
                  onClick={() => handlePurchase(product.id)}
                  disabled={isPurchased}
                  className={`w-full font-extrabold py-2.5 rounded-xl text-sm transition-all ${btnClass}`}
                >
                  {btnText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
     }
