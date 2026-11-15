"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [balance, setBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const tabs = [
    { id: "ALL", label: "All" },
    { id: "LOCK", label: "Lock Plans" },
    { id: "DAILY_PAYOUT", label: "Daily Payouts" },
    { id: "UNLOCK_24H", label: "24Hr Unlock" },
  ];

  // Unique images for different categories
  const images = {
    LOCK: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop",
    DAILY_PAYOUT: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop",
    UNLOCK_24H: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop",
  };

  // FULL 35 PRODUCTS
  const products = [
    // --- LOCK PLANS (15) ---
    { id: "p1", name: "LipaVault", category: "LOCK", price: 10000, daily: "0", cycle: "3d", total: 25000 },
    { id: "p2", name: "LipaCore", category: "LOCK", price: 5000, daily: "0", cycle: "3d", total: 13000 },
    { id: "p3", name: "LipaShield", category: "LOCK", price: 50000, daily: "0", cycle: "2d", total: 75000 },
    { id: "p4", name: "LipaControl", category: "LOCK", price: 100000, daily: "0", cycle: "6d", total: 300000 },
    { id: "p5", name: "LipaCredit", category: "LOCK", price: 150000, daily: "0", cycle: "5d", total: 450000 },
    { id: "p6", name: "LipaDirect", category: "LOCK", price: 200000, daily: "0", cycle: "2d", total: 300000 },
    { id: "p7", name: "LipaOmni", category: "LOCK", price: 75000, daily: "0", cycle: "2d", total: 110000 },
    { id: "p8", name: "LipaAdmin", category: "LOCK", price: 20000, daily: "0", cycle: "5d", total: 50000 },
    { id: "p9", name: "LipaLedger", category: "LOCK", price: 50000, daily: "0", cycle: "3d", total: 80000 },
    { id: "p10", name: "LipaBridge", category: "LOCK", price: 180000, daily: "0", cycle: "4d", total: 400000 },
    { id: "p11", name: "LipaConnect", category: "LOCK", price: 250000, daily: "0", cycle: "3d", total: 500000 },
    { id: "p12", name: "LipaSDK", category: "LOCK", price: 500000, daily: "0", cycle: "2d", total: 100000 },
    { id: "p13", name: "LipaGateway", category: "LOCK", price: 800000, daily: "0", cycle: "2d", total: 2000000 },
    { id: "p14", name: "LipaX", category: "LOCK", price: 1000000, daily: "0", cycle: "2d", total: 3000000 },
    { id: "p15", name: "LipaDashboard", category: "LOCK", price: 2000000, daily: "0", cycle: "2d", total: 4500000 },

    // --- DAILY PAYOUTS (10) ---
    { id: "p16", name: "LipaFlow", category: "DAILY_PAYOUT", price: 5000, daily: "2,000", cycle: "5d", total: 10000 },
    { id: "p17", name: "LipaPulse", category: "DAILY_PAYOUT", price: 10000, daily: "5,000", cycle: "3d", total: 15000 },
    { id: "p18", name: "LipaRewards", category: "DAILY_PAYOUT", price: 25000, daily: "5,000", cycle: "10d", total: 50000 },
    { id: "p19", name: "LipaSub", category: "DAILY_PAYOUT", price: 50000, daily: "15,000", cycle: "8d", total: 120000 },
    { id: "p20", name: "LipaSpend", category: "DAILY_PAYOUT", price: 100000, daily: "25,000", cycle: "9d", total: 225000 },
    { id: "p21", name: "LipaSplit", category: "DAILY_PAYOUT", price: 150000, daily: "40,000", cycle: "8d", total: 320000 },
    { id: "p22", name: "LipaPaylink", category: "DAILY_PAYOUT", price: 250000, daily: "70,000", cycle: "9d", total: 630000 },
    { id: "p23", name: "LipaInvoice", category: "DAILY_PAYOUT", price: 500000, daily: "150,000", cycle: "13d", total: 1950000 },
    { id: "p24", name: "LipaInsights", category: "DAILY_PAYOUT", price: 1000000, daily: "300,000", cycle: "10d", total: 3000000 },
    { id: "p25", name: "LipaVirtual", category: "DAILY_PAYOUT", price: 2000000, daily: "700,000", cycle: "8d", total: 5600000 },

    // --- 24HR UNLOCK (10) ---
    { id: "p26", name: "LipaTap", category: "UNLOCK_24H", price: 5000, daily: "2,500", cycle: "4d", total: 10000 },
    { id: "p27", name: "LipaScan", category: "UNLOCK_24H", price: 10000, daily: "4,500", cycle: "4d", total: 18000 },
    { id: "p28", name: "LipaGo", category: "UNLOCK_24H", price: 25000, daily: "10,000", cycle: "4d", total: 40000 },
    { id: "p29", name: "LipaPocket", category: "UNLOCK_24H", price: 50000, daily: "20,000", cycle: "4d", total: 80000 },
    { id: "p30", name: "LipaWallet", category: "UNLOCK_24H", price: 75000, daily: "30,000", cycle: "4d", total: 120000 },
    { id: "p31", name: "LipaP2P", category: "UNLOCK_24H", price: 100000, daily: "40,000", cycle: "4d", total: 160000 },
    { id: "p32", name: "LipaSoftPOS", category: "UNLOCK_24H", price: 150000, daily: "70,000", cycle: "4d", total: 280000 },
    { id: "p33", name: "LipaTerminal", category: "UNLOCK_24H", price: 250000, daily: "100,000", cycle: "4d", total: 400000 },
    { id: "p34", name: "LipaCheckout", category: "UNLOCK_24H", price: 500000, daily: "250,000", cycle: "4d", total: 1000000 },
    { id: "p35", name: "LipaRegister", category: "UNLOCK_24H", price: 1000000, daily: "500,000", cycle: "4d", total: 2000000 },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: bal } = await supabase.from("balances").select("available").eq("user_id", user.id).single();
      if (bal) setBalance(Number(bal.available));

      const { data: invs } = await supabase.from("investments").select("product_id").eq("user_id", user.id).eq("status", "ACTIVE");
      if (invs) setPurchasedIds(invs.map(i => i.product_id));
    };
    fetchUserData();
  }, []);

  const handlePurchase = async (product: any) => {
    if (isProcessing) return;
    if (purchasedIds.includes(product.id)) return;

    if (balance < product.price) {
      return alert(`Insufficient balance. You need UGX ${product.price.toLocaleString()} to buy this.`);
    }

    setIsProcessing(true);

    try {
      // 1. Deduct Balance
      const newBalance = balance - product.price;
      const { error: balError } = await supabase.from("balances").update({ available: newBalance }).eq("user_id", userId);
      if (balError) throw balError;

      // 2. Create Investment Record
      const { error: invError } = await supabase.from("investments").insert({
        user_id: userId,
        product_id: product.id,
        amount: product.price,
        expected_return: product.total,
        status: "ACTIVE",
      });
      if (invError) throw invError;

      // 3. Update UI
      setBalance(newBalance);
      setPurchasedIds([...purchasedIds, product.id]);
      alert(`Successfully purchased ${product.name}! Check your Income tab.`);

    } catch (error: any) {
      alert("Purchase failed: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = activeTab === "ALL" ? products : products.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="p-5 pt-8 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-[#00d2ff] tracking-tight">LIPA</h1>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Balance</p>
          <p className="text-sm font-bold text-green-400">UGX {balance.toLocaleString()}</p>
        </div>
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
        {filteredProducts.map((product, index) => {
          const isPurchased = purchasedIds.includes(product.id);
          // Cycle through 3 images based on index to make them look varied
          const imgUrl = index % 3 === 0 
            ? "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" 
            : index % 3 === 1 
            ? "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop"
            : "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop";

          let btnText = "";
          let btnClass = "bg-[#00d2ff] hover:bg-cyan-400 text-black shadow-[0_0_10px_rgba(0,210,255,0.3)]";
          if (isPurchased) {
            btnClass = "bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700";
            if (product.category === "LOCK") btnText = "Locked In";
            else if (product.category === "DAILY_PAYOUT") btnText = "Purchased";
            else if (product.category === "UNLOCK_24H") btnText = "Unlocked";
          } else {
            if (product.category === "LOCK") btnText = "Lock In";
            else if (product.category === "DAILY_PAYOUT") btnText = "Buy Now";
            else if (product.category === "UNLOCK_24H") btnText = "Locked";
          }

          return (
            <div key={product.id} className="bg-[#051105] border border-green-500/40 rounded-2xl flex flex-col justify-between overflow-hidden shadow-lg">
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
                  onClick={() => handlePurchase(product)}
                  disabled={isPurchased || isProcessing}
                  className={`w-full font-extrabold py-2.5 rounded-xl text-sm transition-all ${btnClass}`}
                >
                  {isProcessing ? "Wait..." : btnText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
    }
