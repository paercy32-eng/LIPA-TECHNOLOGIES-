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
    { id: "ALL", label: "All Products" },
    { id: "LOCK", label: "Lock Plans" },
    { id: "DAILY_PAYOUT", label: "Daily Payouts" },
    { id: "UNLOCK_24H", label: "24Hr Unlock" },
  ];

  const images = {
    LOCK: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop",
    DAILY_PAYOUT: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop",
    UNLOCK_24H: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop",
  };

  // --- ALL 35 PRODUCTS ---
  const products = [
    // LOCK PLANS (15)
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

    // DAILY PAYOUTS (10)
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

    // 24HR UNLOCK (10)
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
      return alert(`Insufficient balance. You need UGX ${product.price.toLocaleString()}.`);
    }

    setIsProcessing(true);

    try {
      // 1. FIRST PURCHASE RULE
      const { count: invCount } = await supabase
        .from("investments")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userId);

      if (invCount === 0) {
        const { data: deposits } = await supabase
          .from("transactions")
          .select("amount")
          .eq("user_id", userId)
          .eq("type", "DEPOSIT")
          .eq("status", "COMPLETED");

        const totalDeposited = deposits?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

        if (totalDeposited < product.price) {
          setIsProcessing(false);
          return alert(`First Purchase Rule: Your first purchase must be fully funded by approved deposits. You have deposited UGX ${totalDeposited.toLocaleString()}. You need UGX ${product.price.toLocaleString()}. (Welcome bonus and commissions cannot be used for the first purchase).`);
        }
      }

      // 2. Deduct Balance
      const newBalance = balance - product.price;
      const { error: balError } = await supabase.from("balances").update({ available: newBalance }).eq("user_id", userId);
      if (balError) throw balError;

      // 3. Create Investment Record
      const { error: invError } = await supabase.from("investments").insert({
        user_id: userId,
        product_id: product.id,
        amount: product.price,
        expected_return: product.total,
        status: "ACTIVE",
      });
      if (invError) throw invError;

      // 4. Update UI
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
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 pb-24">
      
      {/* Bright Header */}
      <div className="bg-white p-5 pt-8 shadow-sm rounded-b-3xl flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Explore</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">Find your next investment</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 text-right">
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Balance</p>
          <p className="text-sm font-black text-blue-700">UGX {balance.toLocaleString()}</p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex space-x-3 px-5 py-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 whitespace-nowrap rounded-full font-bold text-xs transition-all ${
              activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-[0_5px_15px_rgba(37,99,235,0.3)] scale-105" 
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="px-5 grid grid-cols-2 gap-4">
        {filteredProducts.map((product, index) => {
          const isPurchased = purchasedIds.includes(product.id);
          const imgUrl = index % 3 === 0 
            ? images.LOCK 
            : index % 3 === 1 
            ? images.DAILY_PAYOUT
            : images.UNLOCK_24H;

          let btnText = "";
          let btnClass = "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md";
          
          if (isPurchased) {
            btnClass = "bg-gray-100 text-gray-400 cursor-not-allowed";
            if (product.category === "LOCK") btnText = "Locked In";
            else if (product.category === "DAILY_PAYOUT") btnText = "Purchased";
            else if (product.category === "UNLOCK_24H") btnText = "Unlocked";
          } else {
            if (product.category === "LOCK") btnText = "Lock In";
            else if (product.category === "DAILY_PAYOUT") btnText = "Buy Now";
            else if (product.category === "UNLOCK_24H") btnText = "Locked";
          }

          return (
            <div key={product.id} className="bg-white rounded-3xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
              
              <div>
                {/* Image */}
                <div className="w-full h-24 rounded-2xl overflow-hidden mb-3 relative bg-gray-100">
                  <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] font-bold text-gray-800 shadow-sm uppercase">
                    {product.category.replace('_', ' ')}
                  </div>
                </div>

                {/* Title & Price */}
                <h3 className="text-gray-900 font-extrabold text-[15px] leading-tight mb-1 truncate">{product.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-xs font-bold text-gray-400">UGX</span>
                  <span className="text-xl font-black text-gray-900">{product.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Stats Box */}
              <div>
                <div className="bg-gray-50 rounded-xl p-2.5 mb-3 grid grid-cols-3 gap-1 divide-x divide-gray-200">
                  <div className="text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Daily</p>
                    <p className="text-[11px] font-bold text-blue-600">{product.daily}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Cycle</p>
                    <p className="text-[11px] font-bold text-gray-700">{product.cycle}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Total</p>
                    <p className="text-[11px] font-bold text-green-600">{product.total.toLocaleString()}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handlePurchase(product)}
                  disabled={isPurchased || isProcessing}
                  className={`w-full font-bold py-2.5 rounded-xl text-xs transition-all ${btnClass}`}
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
